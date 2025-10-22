import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, formatEther, parseEther } from 'ethers';

interface Web3ContextType {
  account: string | null;
  balance: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  sendTransaction: (to: string, amount: string) => Promise<string>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  useEffect(() => {
    const savedAccount = localStorage.getItem('web3_account');
    if (savedAccount && window.ethereum) {
      connectWallet();
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Установите MetaMask или другой Web3 кошелёк!');
      return;
    }

    try {
      const ethersProvider = new BrowserProvider(window.ethereum);
      const accounts = await ethersProvider.send('eth_requestAccounts', []);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const bal = await ethersProvider.getBalance(address);

      setProvider(ethersProvider);
      setAccount(address);
      setBalance(formatEther(bal));
      localStorage.setItem('web3_account', address);
    } catch (error) {
      console.error('Ошибка подключения кошелька:', error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setProvider(null);
    localStorage.removeItem('web3_account');
  };

  const sendTransaction = async (to: string, amount: string): Promise<string> => {
    if (!provider || !account) {
      throw new Error('Кошелёк не подключён');
    }

    try {
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to,
        value: parseEther(amount),
      });
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Ошибка транзакции:', error);
      throw error;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        balance,
        isConnected: !!account,
        connectWallet,
        disconnectWallet,
        sendTransaction,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 должен использоваться внутри Web3Provider');
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
