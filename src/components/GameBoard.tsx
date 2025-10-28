import { useState } from 'react';

export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

interface GameBoardProps {
  board: CellState[][];
  onCellClick?: (row: number, col: number) => void;
  showShips?: boolean;
  isPlayerBoard?: boolean;
}

const getShipSegmentStyle = (board: CellState[][], row: number, col: number): string => {
  if (board[row][col] !== 'ship') return '';
  
  const hasLeft = col > 0 && board[row][col - 1] === 'ship';
  const hasRight = col < 9 && board[row][col + 1] === 'ship';
  const hasTop = row > 0 && board[row - 1][col] === 'ship';
  const hasBottom = row < 9 && board[row + 1][col] === 'ship';
  
  if (hasLeft && hasRight) return 'ship-middle-h';
  if (hasTop && hasBottom) return 'ship-middle-v';
  if (hasLeft) return 'ship-right';
  if (hasRight) return 'ship-left';
  if (hasTop) return 'ship-bottom';
  if (hasBottom) return 'ship-top';
  
  return 'ship-single';
};

export default function GameBoard({ board, onCellClick, showShips = false, isPlayerBoard = false }: GameBoardProps) {
  const letters = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];
  
  const getCellContent = (state: CellState, row: number, col: number) => {
    if (state === 'hit') return (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path d="M18 6L6 18M6 6l12 12" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    );
    if (state === 'miss') return (
      <svg viewBox="0 0 24 24" className="w-4 h-4">
        <circle cx="12" cy="12" r="3" fill="#64748b"/>
      </svg>
    );
    if (state === 'ship' && showShips) {
      const shipStyle = getShipSegmentStyle(board, row, col);
      return <div className={`ship-segment ${shipStyle}`}></div>;
    }
    return null;
  };
  
  const getCellClass = (state: CellState) => {
    const baseClass = 'w-9 h-9 border border-blue-200/30 flex items-center justify-center cursor-pointer transition-all relative notebook-cell';
    
    if (state === 'hit') return `${baseClass} bg-red-50`;
    if (state === 'miss') return `${baseClass} bg-blue-50/30`;
    if (state === 'ship' && showShips) return `${baseClass} bg-white`;
    
    return `${baseClass} bg-white hover:bg-blue-50/20`;
  };
  
  return (
    <div className="inline-block notebook-board p-4 shadow-lg">
      <div className="flex gap-0">
        <div className="w-9"></div>
        {letters.map((letter, i) => (
          <div key={i} className="w-9 h-8 flex items-center justify-center font-semibold text-sm text-blue-600">
            {letter}
          </div>
        ))}
      </div>
      
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-0">
          <div className="w-9 h-9 flex items-center justify-center font-semibold text-sm text-blue-600">
            {rowIndex + 1}
          </div>
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={getCellClass(cell)}
              onClick={() => onCellClick?.(rowIndex, colIndex)}
            >
              {getCellContent(cell, rowIndex, colIndex)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}