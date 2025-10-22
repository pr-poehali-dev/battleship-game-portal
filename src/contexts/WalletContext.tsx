import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface WalletContextType {
  coins: number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('battleship_coins');
    return saved ? parseInt(saved) : 1000;
  });

  useEffect(() => {
    localStorage.setItem('battleship_coins', coins.toString());
  }, [coins]);

  const addCoins = (amount: number) => {
    setCoins(prev => prev + amount);
  };

  const spendCoins = (amount: number): boolean => {
    if (coins >= amount) {
      setCoins(prev => prev - amount);
      return true;
    }
    return false;
  };

  return (
    <WalletContext.Provider value={{ coins, addCoins, spendCoins }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}
