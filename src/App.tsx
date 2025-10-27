
import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from '@/contexts/WalletContext';
import { Web3Provider } from '@/contexts/Web3Context';
import { ShipLayoutProvider } from '@/contexts/ShipLayoutContext';
import Home from '@/pages/Home';
import Game from '@/pages/Game';
import OnlineGame from '@/pages/OnlineGame';
import Rules from '@/pages/Rules';
import Rating from '@/pages/Rating';
import Profile from '@/pages/Profile';
import Wallet from '@/pages/Wallet';
import ShipSetup from '@/pages/ShipSetup';

const queryClient = new QueryClient();

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'game':
        return <Game />;
      case 'online':
        return <OnlineGame onNavigate={setCurrentPage} />;
      case 'rules':
        return <Rules onNavigate={setCurrentPage} />;
      case 'rating':
        return <Rating onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile onNavigate={setCurrentPage} />;
      case 'wallet':
        return <Wallet onNavigate={setCurrentPage} />;
      case 'ship-setup':
        return <ShipSetup onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <WalletProvider>
          <ShipLayoutProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <div className="min-h-screen">
                {renderPage()}
              </div>
            </TooltipProvider>
          </ShipLayoutProvider>
        </WalletProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
};

export default App;