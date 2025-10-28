import { useState } from 'react';
import { Button } from '@/components/ui/button';

type CellStatus = 'empty' | 'ship' | 'hit' | 'miss' | 'killed';
type Cell = { status: CellStatus; shipId?: number };
type Board = Cell[][];
type Ship = { id: number; size: number; hits: number; cells: [number, number][] };

const BOARD_SIZE = 10;
const ROWS = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];
const COLS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const SHIPS_CONFIG = [
  { size: 4, count: 1 },
  { size: 3, count: 2 },
  { size: 2, count: 3 },
  { size: 1, count: 4 },
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

const placeShipsRandomly = (): { board: Board; ships: Ship[] } => {
  const board = createEmptyBoard();
  const ships: Ship[] = [];
  let shipId = 0;
  
  SHIPS_CONFIG.forEach(({ size, count }) => {
    for (let i = 0; i < count; i++) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 1000) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        const horizontal = Math.random() > 0.5;
        
        if (canPlaceShip(board, row, col, size, horizontal)) {
          const cells: [number, number][] = [];
          for (let j = 0; j < size; j++) {
            const r = horizontal ? row : row + j;
            const c = horizontal ? col + j : col;
            board[r][c] = { status: 'ship', shipId };
            cells.push([r, c]);
          }
          ships.push({ id: shipId, size, hits: 0, cells });
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
  const [message, setMessage] = useState('Нажмите "Начать игру"');
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

  const markShipAsKilled = (board: Board, ship: Ship): Board => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    
    ship.cells.forEach(([r, c]) => {
      newBoard[r][c].status = 'killed';
      
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            if (newBoard[nr][nc].status === 'empty') {
              newBoard[nr][nc].status = 'miss';
            }
          }
        }
      }
    });
    
    return newBoard;
  };

  const handlePlayerShot = (row: number, col: number) => {
    if (!gameStarted || !playerTurn || gameOver) return;
    
    const cell = enemyBoard[row][col];
    if (cell.status === 'hit' || cell.status === 'miss' || cell.status === 'killed') return;
    
    const newBoard = enemyBoard.map(r => r.map(c => ({ ...c })));
    const newShips = [...enemyShips];
    
    if (cell.status === 'ship' && cell.shipId !== undefined) {
      newBoard[row][col].status = 'hit';
      const ship = newShips.find(s => s.id === cell.shipId);
      
      if (ship) {
        ship.hits++;
        
        if (ship.hits >= ship.size) {
          const boardWithKilled = markShipAsKilled(newBoard, ship);
          setEnemyBoard(boardWithKilled);
          setEnemyShips(newShips);
          
          const allSunk = newShips.every(s => s.hits >= s.size);
          if (allSunk) {
            setMessage('🎉 Победа! Вы потопили весь флот противника!');
            setGameOver(true);
            return;
          }
          
          setMessage(`Убил! Потоплен ${ship.size}-палубный корабль. Ваш ход!`);
        } else {
          setMessage('Попал! Продолжайте стрельбу');
          setEnemyBoard(newBoard);
          setEnemyShips(newShips);
        }
      }
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
    
    const availableCells: [number, number][] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const status = playerBoard[r][c].status;
        if (status !== 'hit' && status !== 'miss' && status !== 'killed') {
          availableCells.push([r, c]);
        }
      }
    }
    
    if (availableCells.length === 0) {
      setPlayerTurn(true);
      return;
    }
    
    const [row, col] = availableCells[Math.floor(Math.random() * availableCells.length)];
    
    const newBoard = playerBoard.map(r => r.map(c => ({ ...c })));
    const newShips = [...playerShips];
    const cell = newBoard[row][col];
    
    if (cell.status === 'ship' && cell.shipId !== undefined) {
      newBoard[row][col].status = 'hit';
      const ship = newShips.find(s => s.id === cell.shipId);
      
      if (ship) {
        ship.hits++;
        
        if (ship.hits >= ship.size) {
          const boardWithKilled = markShipAsKilled(newBoard, ship);
          setPlayerBoard(boardWithKilled);
          setPlayerShips(newShips);
          
          const allSunk = newShips.every(s => s.hits >= s.size);
          if (allSunk) {
            setMessage('💀 Поражение! Противник потопил весь ваш флот');
            setGameOver(true);
            return;
          }
          
          setMessage(`Противник убил ваш ${ship.size}-палубный корабль...`);
          setTimeout(enemyTurn, 1500);
        } else {
          setMessage('Противник попал! Продолжает атаку...');
          setPlayerBoard(newBoard);
          setPlayerShips(newShips);
          setTimeout(enemyTurn, 1500);
        }
      }
    } else {
      newBoard[row][col].status = 'miss';
      setPlayerBoard(newBoard);
      setMessage('Противник промахнулся! Ваш ход');
      setPlayerTurn(true);
    }
  };

  const getCellContent = (status: CellStatus, isPlayerBoard: boolean) => {
    if (status === 'hit') return '×';
    if (status === 'miss') return '·';
    if (status === 'killed') return '×';
    if (status === 'ship' && isPlayerBoard) return '■';
    return '';
  };

  const getCellClassName = (status: CellStatus, isPlayerBoard: boolean) => {
    const base = 'w-9 h-9 flex items-center justify-center text-lg font-bold cursor-pointer transition-all';
    
    if (status === 'killed') return `${base} text-red-600`;
    if (status === 'hit') return `${base} text-red-600`;
    if (status === 'miss') return `${base} text-gray-500`;
    if (status === 'ship' && isPlayerBoard) return `${base} text-blue-600`;
    
    return `${base} hover:bg-blue-100/50`;
  };

  const getShipsCount = (ships: Ship[]) => {
    return {
      alive: ships.filter(s => s.hits < s.size).length,
      total: ships.length
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-blue-900 mb-2" style={{ fontFamily: '"Courier Prime", monospace' }}>
          ⚓ МОРСКОЙ БОЙ ⚓
        </h1>
        <div className="text-xl font-semibold text-blue-800 mb-4 min-h-[2rem]">{message}</div>
        <Button 
          onClick={startGame}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          {gameStarted ? '🔄 Новая игра' : '🎮 Начать игру'}
        </Button>
      </div>

      {gameStarted && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 justify-items-center">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">
              Ваше поле ({getShipsCount(playerShips).alive}/{getShipsCount(playerShips).total} 🚢)
            </h2>
            <div className="notebook-board p-6">
              <div className="flex">
                <div className="w-9"></div>
                {COLS.map((col) => (
                  <div key={col} className="w-9 h-9 flex items-center justify-center font-bold text-blue-900">
                    {col}
                  </div>
                ))}
              </div>
              
              {playerBoard.map((row, r) => (
                <div key={r} className="flex">
                  <div className="w-9 h-9 flex items-center justify-center font-bold text-blue-900">
                    {ROWS[r]}
                  </div>
                  {row.map((cell, c) => (
                    <div
                      key={`player-${r}-${c}`}
                      className={getCellClassName(cell.status, true)}
                    >
                      {getCellContent(cell.status, true)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">
              Поле противника ({getShipsCount(enemyShips).alive}/{getShipsCount(enemyShips).total} 🚢)
            </h2>
            <div className="notebook-board p-6">
              <div className="flex">
                <div className="w-9"></div>
                {COLS.map((col) => (
                  <div key={col} className="w-9 h-9 flex items-center justify-center font-bold text-blue-900">
                    {col}
                  </div>
                ))}
              </div>
              
              {enemyBoard.map((row, r) => (
                <div key={r} className="flex">
                  <div className="w-9 h-9 flex items-center justify-center font-bold text-blue-900">
                    {ROWS[r]}
                  </div>
                  {row.map((cell, c) => (
                    <div
                      key={`enemy-${r}-${c}`}
                      className={getCellClassName(
                        cell.status === 'ship' ? 'empty' : cell.status,
                        false
                      )}
                      onClick={() => handlePlayerShot(r, c)}
                    >
                      {getCellContent(cell.status === 'ship' ? 'empty' : cell.status, false)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <div className="inline-block bg-white/80 backdrop-blur p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-blue-900 mb-3">Флот (классический)</h3>
          <div className="grid grid-cols-2 gap-4 text-left text-blue-800">
            <div>• 1 линкор (4 палубы)</div>
            <div>• 2 крейсера (3 палубы)</div>
            <div>• 3 эсминца (2 палубы)</div>
            <div>• 4 катера (1 палуба)</div>
          </div>
          <div className="mt-4 text-sm text-blue-700">
            <p>× — попадание | · — промах | ■ — ваши корабли</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleshipGame;
