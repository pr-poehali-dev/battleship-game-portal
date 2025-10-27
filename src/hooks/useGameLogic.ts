import { useState, useCallback, useEffect } from 'react';
import { CellState } from '@/components/GameBoard';

interface Ship {
  size: number;
  positions: [number, number][];
}

const BOARD_SIZE = 10;
const SHIPS = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

const createEmptyBoard = (): CellState[][] => {
  return Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill('empty')
  );
};

const canPlaceShip = (board: CellState[][], row: number, col: number, size: number, isHorizontal: boolean): boolean => {
  for (let i = 0; i < size; i++) {
    const r = isHorizontal ? row : row + i;
    const c = isHorizontal ? col + i : col;
    
    if (r >= BOARD_SIZE || c >= BOARD_SIZE) return false;
    if (board[r][c] !== 'empty') return false;
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          if (board[nr][nc] === 'ship') return false;
        }
      }
    }
  }
  return true;
};

const placeShip = (board: CellState[][], row: number, col: number, size: number, isHorizontal: boolean): void => {
  for (let i = 0; i < size; i++) {
    const r = isHorizontal ? row : row + i;
    const c = isHorizontal ? col + i : col;
    board[r][c] = 'ship';
  }
};

const generateRandomBoard = (): { board: CellState[][], ships: Ship[] } => {
  const board = createEmptyBoard();
  const ships: Ship[] = [];
  
  for (const shipSize of SHIPS) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 100) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      const isHorizontal = Math.random() > 0.5;
      
      if (canPlaceShip(board, row, col, shipSize, isHorizontal)) {
        const positions: [number, number][] = [];
        for (let i = 0; i < shipSize; i++) {
          const r = isHorizontal ? row : row + i;
          const c = isHorizontal ? col + i : col;
          positions.push([r, c]);
        }
        placeShip(board, row, col, shipSize, isHorizontal);
        ships.push({ size: shipSize, positions });
        placed = true;
      }
      attempts++;
    }
  }
  
  return { board, ships };
};

const extractShipsFromBoard = (board: CellState[][]): Ship[] => {
  const ships: Ship[] = [];
  const visited = new Set<string>();

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 'ship' && !visited.has(`${r},${c}`)) {
        const positions: [number, number][] = [];
        const isHorizontal = c + 1 < BOARD_SIZE && board[r][c + 1] === 'ship';
        
        let size = 0;
        while (true) {
          const nr = isHorizontal ? r : r + size;
          const nc = isHorizontal ? c + size : c;
          
          if (nr >= BOARD_SIZE || nc >= BOARD_SIZE || board[nr][nc] !== 'ship') break;
          
          positions.push([nr, nc]);
          visited.add(`${nr},${nc}`);
          size++;
        }
        
        ships.push({ size, positions });
      }
    }
  }
  
  return ships;
};

interface GameLogicProps {
  customPlayerBoard?: CellState[][];
}

export const useGameLogic = (props?: GameLogicProps) => {
  const getInitialPlayerData = () => {
    if (props?.customPlayerBoard) {
      return {
        board: props.customPlayerBoard.map(row => [...row]),
        ships: extractShipsFromBoard(props.customPlayerBoard),
      };
    }
    return generateRandomBoard();
  };

  const initialPlayerData = getInitialPlayerData();
  const initialEnemyData = generateRandomBoard();
  
  const [playerBoard, setPlayerBoard] = useState<CellState[][]>(initialPlayerData.board);
  const [enemyBoard, setEnemyBoard] = useState<CellState[][]>(initialEnemyData.board);
  const [enemyShips, setEnemyShips] = useState<Ship[]>(initialEnemyData.ships);
  const [playerShots, setPlayerShots] = useState<CellState[][]>(createEmptyBoard);
  const [gameStatus, setGameStatus] = useState<'setup' | 'playing' | 'won' | 'lost'>('playing');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [message, setMessage] = useState('Ваш ход! Стреляйте по полю противника');
  const [timeLeft, setTimeLeft] = useState(30);
  
  const markAroundSunkShip = (shots: CellState[][], ship: Ship) => {
    const newShots = shots.map(r => [...r]);
    
    ship.positions.forEach(([r, c]) => {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            if (newShots[nr][nc] === 'empty') {
              newShots[nr][nc] = 'miss';
            }
          }
        }
      }
    });
    
    return newShots;
  };
  
  const makePlayerShot = useCallback((row: number, col: number) => {
    if (!isPlayerTurn || gameStatus !== 'playing') return;
    if (playerShots[row][col] !== 'empty') return;
    
    setTimeLeft(30);
    
    const newPlayerShots = playerShots.map(r => [...r]);
    const isHit = enemyBoard[row][col] === 'ship';
    
    newPlayerShots[row][col] = isHit ? 'hit' : 'miss';
    
    if (isHit) {
      const hitShip = enemyShips.find(ship => 
        ship.positions.some(([r, c]) => r === row && c === col)
      );
      
      if (hitShip) {
        const isShipSunk = hitShip.positions.every(([r, c]) => newPlayerShots[r][c] === 'hit');
        
        if (isShipSunk) {
          const shotsWithMarks = markAroundSunkShip(newPlayerShots, hitShip);
          setPlayerShots(shotsWithMarks);
          setMessage('Убил! Стреляйте еще раз!');
        } else {
          setPlayerShots(newPlayerShots);
          setMessage('Попадание! Стреляйте еще раз!');
        }
      } else {
        setPlayerShots(newPlayerShots);
        setMessage('Попадание! Стреляйте еще раз!');
      }
      
      const allShipsSunk = enemyBoard.every((row, r) =>
        row.every((cell, c) => cell !== 'ship' || newPlayerShots[r][c] === 'hit')
      );
      
      if (allShipsSunk) {
        setGameStatus('won');
        setMessage('Победа! Вы потопили все корабли противника!');
      }
    } else {
      setPlayerShots(newPlayerShots);
      setMessage('Промах! Ход противника...');
      setIsPlayerTurn(false);
      setTimeout(makeEnemyShot, 1000);
    }
  }, [isPlayerTurn, gameStatus, playerShots, enemyBoard, enemyShips]);
  
  const makeEnemyShot = useCallback(() => {
    const newEnemyBoard = playerBoard.map(r => [...r]);
    let row, col;
    
    do {
      row = Math.floor(Math.random() * BOARD_SIZE);
      col = Math.floor(Math.random() * BOARD_SIZE);
    } while (newEnemyBoard[row][col] === 'hit' || newEnemyBoard[row][col] === 'miss');
    
    const isHit = newEnemyBoard[row][col] === 'ship';
    newEnemyBoard[row][col] = isHit ? 'hit' : 'miss';
    setPlayerBoard(newEnemyBoard);
    
    if (isHit) {
      setMessage('Противник попал! Он стреляет еще раз...');
      
      const allShipsSunk = playerBoard.every((row) =>
        row.every((cell) => cell !== 'ship' || cell === 'hit')
      );
      
      if (allShipsSunk) {
        setGameStatus('lost');
        setMessage('Поражение! Противник потопил все ваши корабли.');
      } else {
        setTimeout(makeEnemyShot, 1000);
      }
    } else {
      setMessage('Противник промахнулся! Ваш ход!');
      setIsPlayerTurn(true);
    }
  }, [playerBoard]);
  
  const resetGame = useCallback((customBoard?: CellState[][]) => {
    const newPlayerData = customBoard 
      ? { board: customBoard.map(r => [...r]), ships: extractShipsFromBoard(customBoard) }
      : generateRandomBoard();
    const newEnemyData = generateRandomBoard();
    
    setPlayerBoard(newPlayerData.board);
    setEnemyBoard(newEnemyData.board);
    setEnemyShips(newEnemyData.ships);
    setPlayerShots(createEmptyBoard());
    setGameStatus('playing');
    setIsPlayerTurn(true);
    setMessage('Ваш ход! Стреляйте по полю противника');
    setTimeLeft(30);
  }, []);  
  
  useEffect(() => {
    if (!isPlayerTurn || gameStatus !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setMessage('Время вышло! Ход противника...');
          setIsPlayerTurn(false);
          setTimeout(makeEnemyShot, 1000);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlayerTurn, gameStatus, makeEnemyShot]);
  
  return {
    playerBoard,
    enemyBoard,
    playerShots,
    gameStatus,
    isPlayerTurn,
    message,
    timeLeft,
    makePlayerShot,
    resetGame
  };
};