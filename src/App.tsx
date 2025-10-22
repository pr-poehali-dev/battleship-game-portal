
import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from '@/contexts/WalletContext';
import Home from '@/pages/Home';
import Game from '@/pages/Game';
import Rules from '@/pages/Rules';
import Rating from '@/pages/Rating';
import Profile from '@/pages/Profile';

const queryClient = new QueryClient();

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'game':
        return <Game />;
      case 'rules':
        return <Rules onNavigate={setCurrentPage} />;
      case 'rating':
        return <Rating onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen">
            {renderPage()}
          </div>
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
};

export default App;