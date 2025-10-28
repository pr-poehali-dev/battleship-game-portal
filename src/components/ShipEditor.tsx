import { useState, useCallback } from 'react';
import { CellState } from './GameBoard';
import { Button } from './ui/button';
import Icon from './ui/icon';

const BOARD_SIZE = 10;
const SHIPS = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

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

interface ShipEditorProps {
  onSave: (board: CellState[][]) => void;
  initialBoard?: CellState[][];
}

export default function ShipEditor({ onSave, initialBoard }: ShipEditorProps) {
  const createEmptyBoard = (): CellState[][] => {
    return Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill('empty')
    );
  };

  const [board, setBoard] = useState<CellState[][]>(initialBoard || createEmptyBoard());
  const [selectedShipSize, setSelectedShipSize] = useState<number>(4);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [placedShips, setPlacedShips] = useState<number[]>([]);

  const canPlaceShip = (row: number, col: number, size: number, horizontal: boolean): boolean => {
    for (let i = 0; i < size; i++) {
      const r = horizontal ? row : row + i;
      const c = horizontal ? col + i : col;
      
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

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] === 'ship') {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = 'empty';
      setBoard(newBoard);
      
      const shipIndex = placedShips.indexOf(selectedShipSize);
      if (shipIndex > -1) {
        const newPlaced = [...placedShips];
        newPlaced.splice(shipIndex, 1);
        setPlacedShips(newPlaced);
      }
    } else {
      if (canPlaceShip(row, col, selectedShipSize, isHorizontal)) {
        const newBoard = board.map(r => [...r]);
        for (let i = 0; i < selectedShipSize; i++) {
          const r = isHorizontal ? row : row + i;
          const c = isHorizontal ? col + i : col;
          newBoard[r][c] = 'ship';
        }
        setBoard(newBoard);
        setPlacedShips([...placedShips, selectedShipSize]);
      }
    }
  };

  const handleClear = () => {
    setBoard(createEmptyBoard());
    setPlacedShips([]);
  };

  const handleRandom = () => {
    const newBoard = createEmptyBoard();
    const newPlaced: number[] = [];
    
    for (const shipSize of SHIPS) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        const horizontal = Math.random() > 0.5;
        
        let canPlace = true;
        for (let i = 0; i < shipSize; i++) {
          const r = horizontal ? row : row + i;
          const c = horizontal ? col + i : col;
          
          if (r >= BOARD_SIZE || c >= BOARD_SIZE) {
            canPlace = false;
            break;
          }
          if (newBoard[r][c] !== 'empty') {
            canPlace = false;
            break;
          }
          
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                if (newBoard[nr][nc] === 'ship') {
                  canPlace = false;
                  break;
                }
              }
            }
            if (!canPlace) break;
          }
          if (!canPlace) break;
        }
        
        if (canPlace) {
          for (let i = 0; i < shipSize; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            newBoard[r][c] = 'ship';
          }
          newPlaced.push(shipSize);
          placed = true;
        }
        attempts++;
      }
    }
    
    setBoard(newBoard);
    setPlacedShips(newPlaced);
  };

  const isComplete = SHIPS.every(size => {
    const required = SHIPS.filter(s => s === size).length;
    const placed = placedShips.filter(s => s === size).length;
    return placed >= required;
  });

  const getShipCount = (size: number) => {
    const required = SHIPS.filter(s => s === size).length;
    const placed = placedShips.filter(s => s === size).length;
    return { placed, required };
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="notebook-board p-4 w-fit mx-auto">
        <div className="grid grid-cols-10 gap-0">
          {board.map((row, i) => (
            row.map((cell, j) => {
              const shipStyle = cell === 'ship' ? getShipSegmentStyle(board, i, j) : '';
              return (
                <button
                  key={`${i}-${j}`}
                  onClick={() => handleCellClick(i, j)}
                  className={`w-9 h-9 border border-blue-200/30 transition-all relative notebook-cell ${
                    cell === 'ship'
                      ? 'bg-white'
                      : 'bg-white hover:bg-blue-50/20'
                  }`}
                >
                  {cell === 'ship' && (
                    <div className={`ship-segment ${shipStyle}`}></div>
                  )}
                </button>
              );
            })
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="font-bold text-center">Выберите корабль:</div>
        <div className="grid grid-cols-2 gap-2">
          {[4, 3, 2, 1].map(size => {
            const { placed, required } = getShipCount(size);
            return (
              <Button
                key={size}
                onClick={() => setSelectedShipSize(size)}
                variant={selectedShipSize === size ? 'default' : 'outline'}
                className="font-bold"
              >
                {size === 4 && '🚢'}
                {size === 3 && '⛴'}
                {size === 2 && '🛥'}
                {size === 1 && '🚤'}
                {' '}
                {size} клеток ({placed}/{required})
              </Button>
            );
          })}
        </div>

        <Button
          onClick={() => setIsHorizontal(!isHorizontal)}
          variant="outline"
          className="font-bold"
        >
          <Icon name={isHorizontal ? 'MoveHorizontal' : 'MoveVertical'} size={20} />
          {isHorizontal ? 'Горизонтально' : 'Вертикально'}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleClear} variant="outline" className="flex-1 font-bold">
          <Icon name="Trash2" size={16} />
          Очистить
        </Button>
        <Button onClick={handleRandom} variant="outline" className="flex-1 font-bold">
          <Icon name="Shuffle" size={16} />
          Случайно
        </Button>
      </div>

      <Button
        onClick={() => onSave(board)}
        disabled={!isComplete}
        className="font-bold"
      >
        <Icon name="Save" size={16} />
        Сохранить расстановку
      </Button>

      {!isComplete && (
        <div className="text-sm text-muted-foreground text-center">
          Расставьте все корабли для сохранения
        </div>
      )}
    </div>
  );
}