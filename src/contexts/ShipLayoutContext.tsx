import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CellState } from '@/components/GameBoard';

interface ShipLayout {
  id: number;
  name: string;
  board: CellState[][];
  createdAt: number;
}

interface ShipLayoutContextType {
  layouts: ShipLayout[];
  selectedLayoutId: number | null;
  saveLayout: (name: string, board: CellState[][]) => void;
  deleteLayout: (id: number) => void;
  selectLayout: (id: number) => void;
  getSelectedLayout: () => CellState[][] | null;
  updateLayoutName: (id: number, name: string) => void;
}

const ShipLayoutContext = createContext<ShipLayoutContextType | undefined>(undefined);

export function ShipLayoutProvider({ children }: { children: ReactNode }) {
  const [layouts, setLayouts] = useState<ShipLayout[]>(() => {
    const saved = localStorage.getItem('shipLayouts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedLayoutId, setSelectedLayoutId] = useState<number | null>(() => {
    const saved = localStorage.getItem('selectedLayoutId');
    return saved ? parseInt(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('shipLayouts', JSON.stringify(layouts));
  }, [layouts]);

  useEffect(() => {
    if (selectedLayoutId !== null) {
      localStorage.setItem('selectedLayoutId', selectedLayoutId.toString());
    }
  }, [selectedLayoutId]);

  const saveLayout = (name: string, board: CellState[][]) => {
    if (layouts.length >= 5) {
      const oldest = layouts.reduce((prev, curr) => 
        prev.createdAt < curr.createdAt ? prev : curr
      );
      setLayouts(prev => prev.filter(l => l.id !== oldest.id));
    }

    const newLayout: ShipLayout = {
      id: Date.now(),
      name,
      board: board.map(row => [...row]),
      createdAt: Date.now(),
    };

    setLayouts(prev => [...prev, newLayout]);
    setSelectedLayoutId(newLayout.id);
  };

  const deleteLayout = (id: number) => {
    setLayouts(prev => prev.filter(l => l.id !== id));
    if (selectedLayoutId === id) {
      setSelectedLayoutId(null);
    }
  };

  const selectLayout = (id: number) => {
    setSelectedLayoutId(id);
  };

  const getSelectedLayout = (): CellState[][] | null => {
    const layout = layouts.find(l => l.id === selectedLayoutId);
    return layout ? layout.board.map(row => [...row]) : null;
  };

  const updateLayoutName = (id: number, name: string) => {
    setLayouts(prev => prev.map(l => 
      l.id === id ? { ...l, name } : l
    ));
  };

  return (
    <ShipLayoutContext.Provider value={{
      layouts,
      selectedLayoutId,
      saveLayout,
      deleteLayout,
      selectLayout,
      getSelectedLayout,
      updateLayoutName,
    }}>
      {children}
    </ShipLayoutContext.Provider>
  );
}

export function useShipLayout() {
  const context = useContext(ShipLayoutContext);
  if (!context) {
    throw new Error('useShipLayout must be used within ShipLayoutProvider');
  }
  return context;
}
