import { useState } from 'react';

export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

interface GameBoardProps {
  board: CellState[][];
  onCellClick?: (row: number, col: number) => void;
  showShips?: boolean;
  isPlayerBoard?: boolean;
}

export default function GameBoard({ board, onCellClick, showShips = false, isPlayerBoard = false }: GameBoardProps) {
  const letters = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];
  
  const getCellContent = (state: CellState) => {
    if (state === 'hit') return '✕';
    if (state === 'miss') return '•';
    if (state === 'ship' && showShips) return '▪';
    return '';
  };
  
  const getCellClass = (state: CellState) => {
    const baseClass = 'w-8 h-8 border border-muted flex items-center justify-center cursor-pointer transition-all hover:bg-accent/20 text-lg font-bold';
    
    if (state === 'hit') return `${baseClass} bg-destructive text-destructive-foreground`;
    if (state === 'miss') return `${baseClass} bg-secondary/30 text-secondary`;
    if (state === 'ship' && showShips) return `${baseClass} bg-muted`;
    
    return `${baseClass} bg-card`;
  };
  
  return (
    <div className="inline-block bg-background/50 p-4 border-2 border-border shadow-lg">
      <div className="flex gap-0">
        <div className="w-8"></div>
        {letters.map((letter, i) => (
          <div key={i} className="w-8 h-8 flex items-center justify-center font-bold text-sm">
            {letter}
          </div>
        ))}
      </div>
      
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-0">
          <div className="w-8 h-8 flex items-center justify-center font-bold text-sm">
            {rowIndex + 1}
          </div>
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={getCellClass(cell)}
              onClick={() => onCellClick?.(rowIndex, colIndex)}
            >
              {getCellContent(cell)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
