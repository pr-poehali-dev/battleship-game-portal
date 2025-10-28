import { useState } from 'react';
import BattleshipGame from '@/components/BattleshipGame';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <BattleshipGame />
    </div>
  );
};

export default App;