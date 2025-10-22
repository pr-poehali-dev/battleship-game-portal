import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface RulesProps {
  onNavigate: (page: string) => void;
}

export default function Rules({ onNavigate }: RulesProps) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          onClick={() => onNavigate('home')}
          variant="outline"
          className="mb-6"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад
        </Button>
        
        <h1 className="text-4xl font-bold mb-8 text-center">
          # ПРАВИЛА ИГРЫ
        </h1>
        
        <Card className="p-8 border-2 border-border mb-6">
          <h2 className="text-2xl font-bold mb-4">ЦЕЛЬ ИГРЫ</h2>
          <p className="text-lg mb-4">
            Потопить все корабли противника раньше, чем он потопит ваши.
          </p>
        </Card>
        
        <Card className="p-8 border-2 border-border mb-6">
          <h2 className="text-2xl font-bold mb-4">СОСТАВ ФЛОТА</h2>
          <div className="space-y-2 text-lg">
            <p>• 1 линкор (4 клетки) — ▪▪▪▪</p>
            <p>• 2 крейсера (3 клетки) — ▪▪▪</p>
            <p>• 3 эсминца (2 клетки) — ▪▪</p>
            <p>• 4 катера (1 клетка) — ▪</p>
          </div>
        </Card>
        
        <Card className="p-8 border-2 border-border mb-6">
          <h2 className="text-2xl font-bold mb-4">КАК ИГРАТЬ</h2>
          <div className="space-y-4 text-lg">
            <div>
              <p className="font-bold mb-2">1. Расстановка кораблей</p>
              <p className="text-muted-foreground">
                Корабли расставляются автоматически в начале игры. Они не могут касаться друг друга даже углами.
              </p>
            </div>
            
            <div>
              <p className="font-bold mb-2">2. Ваш ход</p>
              <p className="text-muted-foreground">
                Кликните на клетку поля противника для выстрела. ✕ означает попадание, • означает промах.
              </p>
            </div>
            
            <div>
              <p className="font-bold mb-2">3. Попадание</p>
              <p className="text-muted-foreground">
                При попадании вы стреляете снова. Продолжайте, пока не промажете.
              </p>
            </div>
            
            <div>
              <p className="font-bold mb-2">4. Промах</p>
              <p className="text-muted-foreground">
                При промахе ход переходит к противнику. Он стреляет автоматически.
              </p>
            </div>
            
            <div>
              <p className="font-bold mb-2">5. Победа</p>
              <p className="text-muted-foreground">
                Игра заканчивается, когда все корабли одной из сторон потоплены.
              </p>
            </div>
          </div>
        </Card>
        
        <div className="text-center">
          <Button 
            onClick={() => onNavigate('game')}
            variant="destructive"
            size="lg"
            className="text-xl py-8 px-12 font-bold"
          >
            <Icon name="Play" size={24} className="mr-2" />
            НАЧАТЬ ИГРУ
          </Button>
        </div>
      </div>
    </div>
  );
}
