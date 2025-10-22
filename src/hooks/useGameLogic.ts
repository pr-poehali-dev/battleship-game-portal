import { useState, useCallback } from 'react';
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

const generateRandomBoard = (): CellState[][] => {
  const board = createEmptyBoard();
  
  for (const shipSize of SHIPS) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 100) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      const isHorizontal = Math.random() > 0.5;
      
      if (canPlaceShip(board, row, col, shipSize, isHorizontal)) {
        placeShip(board, row, col, shipSize, isHorizontal);
        placed = true;
      }
      attempts++;
    }
  }
  
  return board;
};

export const useGameLogic = () => {
  const [playerBoard, setPlayerBoard] = useState<CellState[][]>(generateRandomBoard);
  const [enemyBoard, setEnemyBoard] = useState<CellState[][]>(generateRandomBoard);
  const [playerShots, setPlayerShots] = useState<CellState[][]>(createEmptyBoard);
  const [gameStatus, setGameStatus] = useState<'setup' | 'playing' | 'won' | 'lost'>('playing');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [message, setMessage] = useState('Ваш ход! Стреляйте по полю противника');
  
  const makePlayerShot = useCallback((row: number, col: number) => {
    if (!isPlayerTurn || gameStatus !== 'playing') return;
    if (playerShots[row][col] !== 'empty') return;
    
    const newPlayerShots = playerShots.map(r => [...r]);
    const isHit = enemyBoard[row][col] === 'ship';
    
    newPlayerShots[row][col] = isHit ? 'hit' : 'miss';
    setPlayerShots(newPlayerShots);
    
    if (isHit) {
      setMessage('Попадание! Стреляйте еще раз!');
      
      const allShipsSunk = enemyBoard.every((row, r) =>
        row.every((cell, c) => cell !== 'ship' || newPlayerShots[r][c] === 'hit')
      );
      
      if (allShipsSunk) {
        setGameStatus('won');
        setMessage('Победа! Вы потопили все корабли противника!');
      }
    } else {
      setMessage('Промах! Ход противника...');
      setIsPlayerTurn(false);
      setTimeout(makeEnemyShot, 1000);
    }
  }, [isPlayerTurn, gameStatus, playerShots, enemyBoard]);
  
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
  
  const resetGame = useCallback(() => {
    setPlayerBoard(generateRandomBoard());
    setEnemyBoard(generateRandomBoard());
    setPlayerShots(createEmptyBoard());
    setGameStatus('playing');
    setIsPlayerTurn(true);
    setMessage('Ваш ход! Стреляйте по полю противника');
  }, []);
  
  return {
    playerBoard,
    enemyBoard,
    playerShots,
    gameStatus,
    isPlayerTurn,
    message,
    makePlayerShot,
    resetGame
  };
};
