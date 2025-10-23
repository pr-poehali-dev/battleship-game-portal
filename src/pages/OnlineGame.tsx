import GameBoard from '@/components/GameBoard';
import { CellState } from '@/components/GameBoard';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const GAME_SERVER_URL = 'https://functions.poehali.dev/b3b73dea-6e2f-4e92-a84e-51cdabb75707';

interface OnlineGameProps {
  onNavigate: (page: string) => void;
}

export default function OnlineGame({ onNavigate }: OnlineGameProps) {
  const { coins, addCoins } = useWallet();
  const { toast } = useToast();
  
  const [playerId] = useState(`player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'searching' | 'waiting' | 'playing' | 'won' | 'lost'>('searching');
  const [playerBoard, setPlayerBoard] = useState<CellState[][]>([]);
  const [playerShots, setPlayerShots] = useState<CellState[][]>([]);
  const [opponentShots, setOpponentShots] = useState<CellState[][]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [message, setMessage] = useState('Поиск противника...');
  const [playersCount, setPlayersCount] = useState(1);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const createEmptyBoard = (): CellState[][] => {
    return Array(10).fill(null).map(() => Array(10).fill('empty'));
  };

  const canPlaceShip = (board: CellState[][], row: number, col: number, size: number, isHorizontal: boolean): boolean => {
    for (let i = 0; i < size; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      
      if (r >= 10 || c >= 10) return false;
      if (board[r][c] !== 'empty') return false;
      
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
            if (board[nr][nc] === 'ship') return false;
          }
        }
      }
    }
    return true;
  };

  const generateRandomBoard = (): CellState[][] => {
    const board = createEmptyBoard();
    const SHIPS = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    
    for (const shipSize of SHIPS) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const isHorizontal = Math.random() > 0.5;
        
        if (canPlaceShip(board, row, col, shipSize, isHorizontal)) {
          for (let i = 0; i < shipSize; i++) {
            const r = isHorizontal ? row : row + i;
            const c = isHorizontal ? col + i : col;
            board[r][c] = 'ship';
          }
          placed = true;
        }
        attempts++;
      }
    }
    
    return board;
  };

  const joinGame = async () => {
    try {
      const board = generateRandomBoard();
      setPlayerBoard(board);
      setPlayerShots(createEmptyBoard());
      setOpponentShots(createEmptyBoard());

      const response = await fetch(`${GAME_SERVER_URL}?action=join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          playerName: 'Игрок',
          board: board.map(row => row.map(cell => cell))
        })
      });

      const data = await response.json();
      setRoomId(data.roomId);
      setPlayersCount(data.playersCount);

      if (data.playersCount === 2) {
        await markReady(data.roomId);
      } else {
        setGameStatus('waiting');
        setMessage('Ожидание второго игрока...');
      }
    } catch (error) {
      toast({
        title: 'Ошибка подключения',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive'
      });
    }
  };

  const markReady = async (room: string) => {
    try {
      await fetch(`${GAME_SERVER_URL}?action=ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room, playerId })
      });
    } catch (error) {
      console.error('Ready error:', error);
    }
  };

  const pollGameState = async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`${GAME_SERVER_URL}?roomId=${roomId}&playerId=${playerId}`);
      const data = await response.json();

      setPlayersCount(data.playersCount);

      if (data.status === 'playing' && gameStatus !== 'playing') {
        setGameStatus('playing');
        setIsMyTurn(data.isYourTurn);
        setMessage(data.isYourTurn ? 'Ваш ход!' : 'Ход противника...');
      }

      if (data.status === 'playing') {
        setIsMyTurn(data.isYourTurn);
        setMessage(data.isYourTurn ? 'Ваш ход!' : 'Ход противника...');

        if (data.yourShots) {
          setPlayerShots(data.yourShots);
        }

        if (data.opponentShots) {
          const newBoard = playerBoard.map((row, r) =>
            row.map((cell, c) => {
              if (data.opponentShots[r][c] === 'hit' || data.opponentShots[r][c] === 'miss') {
                return data.opponentShots[r][c];
              }
              return cell;
            })
          );
          setPlayerBoard(newBoard);
        }

        if (data.winner) {
          if (data.winner === playerId) {
            setGameStatus('won');
            setMessage('Победа! Вы потопили все корабли противника!');
            if (!rewardClaimed) {
              addCoins(1000);
              setRewardClaimed(true);
            }
          } else {
            setGameStatus('lost');
            setMessage('Поражение! Противник потопил все ваши корабли.');
          }
        }
      }
    } catch (error) {
      console.error('Poll error:', error);
    }
  };

  const makeShot = async (row: number, col: number) => {
    if (!isMyTurn || gameStatus !== 'playing' || !roomId) return;
    if (playerShots[row][col] !== 'empty') return;

    try {
      const response = await fetch(`${GAME_SERVER_URL}?action=shoot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId, row, col })
      });

      const data = await response.json();

      if (data.error) {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive'
        });
        return;
      }

      const newShots = playerShots.map(r => [...r]);
      newShots[row][col] = data.hit ? 'hit' : 'miss';
      setPlayerShots(newShots);

      if (data.hit) {
        setMessage('Попадание! Стреляйте еще раз!');
      } else {
        setMessage('Промах! Ход противника...');
        setIsMyTurn(false);
      }

      if (data.gameOver) {
        if (data.winner === playerId) {
          setGameStatus('won');
          setMessage('Победа! Вы потопили все корабли противника!');
          if (!rewardClaimed) {
            addCoins(1000);
            setRewardClaimed(true);
          }
        }
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить выстрел',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    joinGame();
  }, []);

  useEffect(() => {
    if (roomId && (gameStatus === 'waiting' || gameStatus === 'playing')) {
      const interval = setInterval(pollGameState, 2000);
      return () => clearInterval(interval);
    }
  }, [roomId, gameStatus, playerBoard]);

  const handleNewGame = () => {
    setRoomId(null);
    setGameStatus('searching');
    setRewardClaimed(false);
    joinGame();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Button 
          onClick={() => onNavigate('home')}
          variant="outline"
          className="mb-6"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Главное меню
        </Button>

        <h1 className="text-4xl font-bold text-center mb-2 tracking-tight">
          # ОНЛАЙН МОРСКОЙ БОЙ
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          ════════════════════════════════
        </p>
        
        <Card className="p-6 mb-6 bg-card border-2 border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-lg font-bold">
                {message}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold bg-secondary px-3 py-1 rounded border-2 border-border">
                <Icon name="Users" size={16} />
                Игроков: {playersCount}/2
              </div>
              <div className="flex items-center gap-2 text-sm font-bold bg-secondary px-3 py-1 rounded border-2 border-border">
                <Icon name="Coins" size={16} />
                {coins}
              </div>
            </div>
            {gameStatus === 'playing' || gameStatus === 'won' || gameStatus === 'lost' ? (
              <Button 
                onClick={handleNewGame}
                variant="destructive"
                className="font-bold"
              >
                НОВАЯ ИГРА
              </Button>
            ) : null}
          </div>
        </Card>

        {(gameStatus === 'searching' || gameStatus === 'waiting') && (
          <Card className="p-12 text-center border-2 border-border">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">{message}</h2>
            <p className="text-muted-foreground">
              {gameStatus === 'waiting' 
                ? 'Как только найдется противник, игра начнется автоматически'
                : 'Подключение к серверу...'
              }
            </p>
          </Card>
        )}
        
        {(gameStatus === 'playing' || gameStatus === 'won' || gameStatus === 'lost') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start justify-items-center">
            <div>
              <h2 className="text-xl font-bold mb-4 text-center">
                ВАШ ФЛОТ
              </h2>
              <GameBoard 
                board={playerBoard} 
                showShips={true}
                isPlayerBoard={true}
              />
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Ваши корабли и выстрелы противника
              </div>
            </div>
          
            <div>
              <h2 className="text-xl font-bold mb-4 text-center">
                ФЛОТ ПРОТИВНИКА
              </h2>
              <GameBoard 
                board={playerShots}
                onCellClick={isMyTurn ? makeShot : undefined}
              />
              <div className="mt-4 text-sm text-muted-foreground text-center">
                {isMyTurn ? 'Стреляйте по клеткам противника' : 'Ожидайте своего хода'}
              </div>
            </div>
          </div>
        )}
        
        {gameStatus === 'won' && (
          <Card className="mt-8 p-6 bg-secondary text-secondary-foreground border-2 border-border">
            <h2 className="text-2xl font-bold text-center">
              🎉 ПОБЕДА! 🎉
            </h2>
            <p className="text-center mt-2">
              Вы победили реального противника!
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-xl font-bold">
              <Icon name="Coins" size={24} />
              +1000 монет за победу!
            </div>
          </Card>
        )}
        
        {gameStatus === 'lost' && (
          <Card className="mt-8 p-6 bg-destructive text-destructive-foreground border-2 border-border">
            <h2 className="text-2xl font-bold text-center">
              ПОРАЖЕНИЕ
            </h2>
            <p className="text-center mt-2">
              Противник оказался сильнее в этот раз
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
