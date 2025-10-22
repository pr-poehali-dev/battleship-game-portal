import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/contexts/WalletContext';
import { useState } from 'react';

interface ProfileProps {
  onNavigate: (page: string) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const { coins } = useWallet();
  const [username, setUsername] = useState('Капитан Врунгель');
  const [email, setEmail] = useState('captain@battleship.ru');
  
  const stats = {
    gamesPlayed: 167,
    wins: 132,
    losses: 35,
    winRate: 79,
    totalShots: 3421,
    accuracy: 42,
    bestStreak: 12
  };
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          onClick={() => onNavigate('home')}
          variant="outline"
          className="mb-6"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад
        </Button>
        
        <h1 className="text-4xl font-bold mb-2 text-center">
          # ПРОФИЛЬ ИГРОКА
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          ════════════════════════════════
        </p>
        
        <Card className="p-6 border-2 border-border mb-6 bg-secondary">
          <div className="flex items-center justify-center gap-4">
            <div className="text-4xl">💰</div>
            <div>
              <div className="text-sm text-muted-foreground font-bold">ВАШ БАЛАНС</div>
              <div className="text-3xl font-bold">{coins.toLocaleString()} монет</div>
            </div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 border-2 border-border">
            <h2 className="text-2xl font-bold mb-6">ДАННЫЕ ПРОФИЛЯ</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="font-bold">Имя игрока</Label>
                <Input 
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 font-bold border-2"
                />
              </div>
              <div>
                <Label htmlFor="email" className="font-bold">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 font-bold border-2"
                />
              </div>
              <Button variant="destructive" className="w-full font-bold">
                СОХРАНИТЬ
              </Button>
            </div>
          </Card>
          
          <Card className="p-6 border-2 border-border">
            <h2 className="text-2xl font-bold mb-6">СТАТИСТИКА</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-bold">Всего игр:</span>
                <span className="text-xl font-bold">{stats.gamesPlayed}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-bold">Побед:</span>
                <span className="text-xl font-bold text-secondary">{stats.wins}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-bold">Поражений:</span>
                <span className="text-xl font-bold text-destructive">{stats.losses}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-bold">Процент побед:</span>
                <span className="text-xl font-bold">{stats.winRate}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-bold">Всего выстрелов:</span>
                <span className="text-xl font-bold">{stats.totalShots}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-bold">Точность:</span>
                <span className="text-xl font-bold">{stats.accuracy}%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-bold">Лучшая серия:</span>
                <span className="text-xl font-bold">{stats.bestStreak} побед</span>
              </div>
            </div>
          </Card>
        </div>
        
        <Card className="p-6 border-2 border-border">
          <h2 className="text-2xl font-bold mb-4">ДОСТИЖЕНИЯ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded border-2 border-border">
              <div className="text-4xl mb-2">🏆</div>
              <div className="font-bold text-sm">Первая победа</div>
            </div>
            <div className="text-center p-4 bg-muted rounded border-2 border-border">
              <div className="text-4xl mb-2">🎯</div>
              <div className="font-bold text-sm">Снайпер</div>
            </div>
            <div className="text-center p-4 bg-muted rounded border-2 border-border">
              <div className="text-4xl mb-2">⚡</div>
              <div className="font-bold text-sm">Быстрая победа</div>
            </div>
            <div className="text-center p-4 bg-muted rounded border-2 border-border">
              <div className="text-4xl mb-2">🔥</div>
              <div className="font-bold text-sm">10 побед подряд</div>
            </div>
          </div>
        </Card>
        
        <div className="text-center mt-8">
          <Button 
            onClick={() => onNavigate('game')}
            variant="destructive"
            size="lg"
            className="text-xl py-6 px-12 font-bold"
          >
            <Icon name="Play" size={24} className="mr-2" />
            НАЧАТЬ ИГРУ
          </Button>
        </div>
      </div>
    </div>
  );
}