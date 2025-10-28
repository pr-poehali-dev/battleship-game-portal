import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type CellStatus = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';
type Cell = { status: CellStatus; shipId?: number };
type Board = Cell[][];
type Ship = { id: number; size: number; hits: number; sunk: boolean };

const BOARD_SIZE = 10;
const SHIPS = [
  { size: 4, count: 1, name: 'Линкор' },
  { size: 3, count: 2, name: 'Крейсер' },
  { size: 2, count: 3, name: 'Эсминец' },
  { size: 1, count: 4, name: 'Катер' },
];

const createEmptyBoard = (): Board => {
  return Array(BOARD_SIZE).fill(null).map(() =>
    Array(BOARD_SIZE).fill(null).map(() => ({ status: 'empty' }))
  );
};

const canPlaceShip = (board: Board, row: number, col: number, size: number, horizontal: boolean): boolean => {
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    
    if (r >= BOARD_SIZE || c >= BOARD_SIZE) return false;
    if (board[r][c].status !== 'empty') return false;
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          if (board[nr][nc].status === 'ship') return false;
        }
      }
    }
  }
  return true;
};

const placeShip = (board: Board, row: number, col: number, size: number, horizontal: boolean, shipId: number): void => {
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    board[r][c] = { status: 'ship', shipId };
  }
};

const placeShipsRandomly = (): { board: Board; ships: Ship[] } => {
  const board = createEmptyBoard();
  const ships: Ship[] = [];
  let shipId = 0;
  
  SHIPS.forEach(({ size, count }) => {
    for (let i = 0; i < count; i++) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 1000) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        const horizontal = Math.random() > 0.5;
        
        if (canPlaceShip(board, row, col, size, horizontal)) {
          placeShip(board, row, col, size, horizontal, shipId);
          ships.push({ id: shipId, size, hits: 0, sunk: false });
          shipId++;
          placed = true;
        }
        attempts++;
      }
    }
  });
  
  return { board, ships };
};

const BattleshipGame = () => {
  const [playerBoard, setPlayerBoard] = useState<Board>(createEmptyBoard());
  const [enemyBoard, setEnemyBoard] = useState<Board>(createEmptyBoard());
  const [playerShips, setPlayerShips] = useState<Ship[]>([]);
  const [enemyShips, setEnemyShips] = useState<Ship[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [message, setMessage] = useState('Нажмите "Начать игру" для старта');
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    const playerData = placeShipsRandomly();
    const enemyData = placeShipsRandomly();
    
    setPlayerBoard(playerData.board);
    setEnemyBoard(enemyData.board);
    setPlayerShips(playerData.ships);
    setEnemyShips(enemyData.ships);
    setGameStarted(true);
    setPlayerTurn(true);
    setGameOver(false);
    setMessage('Ваш ход! Выберите клетку на поле противника');
  };

  const markSurroundingCells = (board: Board, shipId: number): Board => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (newBoard[r][c].shipId === shipId) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                if (newBoard[nr][nc].status === 'empty') {
                  newBoard[nr][nc].status = 'miss';
                }
              }
            }
          }
        }
      }
    }
    
    return newBoard;
  };

  const handlePlayerShot = (row: number, col: number) => {
    if (!gameStarted || !playerTurn || gameOver) return;
    
    const cell = enemyBoard[row][col];
    if (cell.status === 'hit' || cell.status === 'miss') return;
    
    const newBoard = enemyBoard.map(r => r.map(c => ({ ...c })));
    const newShips = [...enemyShips];
    
    if (cell.status === 'ship' && cell.shipId !== undefined) {
      newBoard[row][col].status = 'hit';
      const ship = newShips.find(s => s.id === cell.shipId);
      
      if (ship) {
        ship.hits++;
        if (ship.hits >= ship.size) {
          ship.sunk = true;
          const boardWithMarks = markSurroundingCells(newBoard, ship.id);
          setEnemyBoard(boardWithMarks);
          setEnemyShips(newShips);
          setMessage('Убил! Стреляйте еще раз');
          
          const allSunk = newShips.every(s => s.sunk);
          if (allSunk) {
            setMessage('🎉 Вы победили!');
            setGameOver(true);
          }
          return;
        } else {
          setMessage('Ранил! Стреляйте еще раз');
        }
      }
      
      setEnemyBoard(newBoard);
      setEnemyShips(newShips);
    } else {
      newBoard[row][col].status = 'miss';
      setEnemyBoard(newBoard);
      setMessage('Мимо! Ход противника');
      setPlayerTurn(false);
      setTimeout(enemyTurn, 1000);
    }
  };

  const enemyTurn = () => {
    if (gameOver) return;
    
    let row: number, col: number;
    let attempts = 0;
    
    do {
      row = Math.floor(Math.random() * BOARD_SIZE);
      col = Math.floor(Math.random() * BOARD_SIZE);
      attempts++;
    } while ((playerBoard[row][col].status === 'hit' || playerBoard[row][col].status === 'miss') && attempts < 100);
    
    if (attempts >= 100) {
      setPlayerTurn(true);
      setMessage('Ваш ход!');
      return;
    }
    
    const newBoard = playerBoard.map(r => r.map(c => ({ ...c })));
    const newShips = [...playerShips];
    const cell = newBoard[row][col];
    
    if (cell.status === 'ship' && cell.shipId !== undefined) {
      newBoard[row][col].status = 'hit';
      const ship = newShips.find(s => s.id === cell.shipId);
      
      if (ship) {
        ship.hits++;
        if (ship.hits >= ship.size) {
          ship.sunk = true;
          const boardWithMarks = markSurroundingCells(newBoard, ship.id);
          setPlayerBoard(boardWithMarks);
          setPlayerShips(newShips);
          setMessage('Противник убил ваш корабль...');
          
          const allSunk = newShips.every(s => s.sunk);
          if (allSunk) {
            setMessage('💀 Вы проиграли!');
            setGameOver(true);
            return;
          }
          
          setTimeout(enemyTurn, 1500);
          return;
        } else {
          setMessage('Противник ранил ваш корабль!');
        }
      }
      
      setPlayerBoard(newBoard);
      setPlayerShips(newShips);
      setTimeout(enemyTurn, 1500);
    } else {
      newBoard[row][col].status = 'miss';
      setPlayerBoard(newBoard);
      setMessage('Противник промахнулся! Ваш ход');
      setPlayerTurn(true);
    }
  };

  const getCellClassName = (status: CellStatus, isPlayerBoard: boolean) => {
    const base = 'w-8 h-8 border border-blue-400 cursor-pointer transition-all hover:scale-105';
    
    if (status === 'ship' && isPlayerBoard) return `${base} bg-blue-600 border-blue-800`;
    if (status === 'hit') return `${base} bg-red-600 border-red-800`;
    if (status === 'miss') return `${base} bg-gray-400`;
    if (status === 'sunk') return `${base} bg-red-900 border-red-900`;
    
    return `${base} bg-blue-100/20 hover:bg-blue-200/30`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-white">
      <h1 className="text-4xl font-bold text-center mb-2">⚓ Морской Бой</h1>
      
      <div className="text-center mb-6">
        <div className="text-xl font-semibold mb-4 min-h-[2rem]">{message}</div>
        <Button 
          onClick={startGame}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {gameStarted ? 'Новая игра' : 'Начать игру'}
        </Button>
      </div>

      {gameStarted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Ваше поле</h2>
            <div className="inline-block bg-blue-950/50 p-4 rounded-lg backdrop-blur">
              <div className="grid grid-cols-10 gap-0.5">
                {playerBoard.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`player-${r}-${c}`}
                      className={getCellClassName(cell.status, true)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Поле противника</h2>
            <div className="inline-block bg-blue-950/50 p-4 rounded-lg backdrop-blur">
              <div className="grid grid-cols-10 gap-0.5">
                {enemyBoard.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`enemy-${r}-${c}`}
                      className={getCellClassName(
                        cell.status === 'ship' ? 'empty' : cell.status,
                        false
                      )}
                      onClick={() => handlePlayerShot(r, c)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-blue-200">
        <p>🎯 Красный = попадание | ⚪ Серый = мимо | 🚢 Синий = ваши корабли</p>
      </div>
    </div>
  );
};

export default BattleshipGame;
