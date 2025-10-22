import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 tracking-tight">
            # МОРСКОЙ БОЙ
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Классическая игра на бумаге
          </p>
          <p className="text-sm text-muted-foreground">
            ════════════════════════════════
          </p>
        </div>
        
        <Card className="p-8 border-2 border-border shadow-2xl mb-8">
          <div className="space-y-4">
            <Button 
              onClick={() => onNavigate('game')}
              variant="destructive"
              size="lg"
              className="w-full text-xl py-8 font-bold"
            >
              <Icon name="Play" size={24} className="mr-2" />
              НАЧАТЬ ИГРУ
            </Button>
            
            <Button 
              onClick={() => onNavigate('rules')}
              variant="outline"
              size="lg"
              className="w-full text-lg py-6 font-bold"
            >
              <Icon name="BookOpen" size={20} className="mr-2" />
              ПРАВИЛА
            </Button>
            
            <Button 
              onClick={() => onNavigate('rating')}
              variant="outline"
              size="lg"
              className="w-full text-lg py-6 font-bold"
            >
              <Icon name="Trophy" size={20} className="mr-2" />
              РЕЙТИНГ
            </Button>
            
            <Button 
              onClick={() => onNavigate('profile')}
              variant="outline"
              size="lg"
              className="w-full text-lg py-6 font-bold"
            >
              <Icon name="User" size={20} className="mr-2" />
              ПРОФИЛЬ
            </Button>
          </div>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Потопите все корабли противника раньше, чем он потопит ваши!</p>
        </div>
      </div>
    </div>
  );
}
