import GameBoard from '@/components/GameBoard';
import { useGameLogic } from '@/hooks/useGameLogic';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Game() {
  const {
    playerBoard,
    enemyBoard,
    playerShots,
    gameStatus,
    message,
    makePlayerShot,
    resetGame
  } = useGameLogic();
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 tracking-tight">
          # МОРСКОЙ БОЙ
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          ════════════════════════════════
        </p>
        
        <Card className="p-6 mb-6 bg-card border-2 border-border">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">
              {message}
            </div>
            <Button 
              onClick={resetGame}
              variant="destructive"
              className="font-bold"
            >
              НОВАЯ ИГРА
            </Button>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start justify-items-center">
          <div>
            <h2 className="text-xl font-bold mb-4 text-center">
              ВАШ ФЛОТ
            </h2>
            <GameBoard 
              board={playerBoard} 
              showShips={true}
              isPlayerBoard={true}
            />
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Ваши корабли и выстрелы противника
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4 text-center">
              ФЛОТ ПРОТИВНИКА
            </h2>
            <GameBoard 
              board={playerShots}
              onCellClick={makePlayerShot}
            />
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Стреляйте по клеткам противника
            </div>
          </div>
        </div>
        
        {gameStatus === 'won' && (
          <Card className="mt-8 p-6 bg-secondary text-secondary-foreground border-2 border-border">
            <h2 className="text-2xl font-bold text-center">
              🎉 ПОБЕДА! 🎉
            </h2>
            <p className="text-center mt-2">
              Вы потопили все корабли противника!
            </p>
          </Card>
        )}
        
        {gameStatus === 'lost' && (
          <Card className="mt-8 p-6 bg-destructive text-destructive-foreground border-2 border-border">
            <h2 className="text-2xl font-bold text-center">
              ПОРАЖЕНИЕ
            </h2>
            <p className="text-center mt-2">
              Противник потопил все ваши корабли
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
