import { useState } from 'react';
import BattleshipGame from '@/components/BattleshipGame';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <BattleshipGame />
    </div>
  );
};

export default App;
