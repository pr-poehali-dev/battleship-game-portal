import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RatingProps {
  onNavigate: (page: string) => void;
}

const mockRatings = [
  { rank: 1, name: 'Адмирал Нахимов', wins: 147, losses: 23, winRate: 86 },
  { rank: 2, name: 'Капитан Врунгель', wins: 132, losses: 35, winRate: 79 },
  { rank: 3, name: 'Боцман Смит', wins: 118, losses: 42, winRate: 74 },
  { rank: 4, name: 'Матрос Железняк', wins: 95, losses: 48, winRate: 66 },
  { rank: 5, name: 'Кок Поварёшкин', wins: 87, losses: 51, winRate: 63 },
  { rank: 6, name: 'Юнга Петров', wins: 73, losses: 59, winRate: 55 },
  { rank: 7, name: 'Штурман Компас', wins: 68, losses: 64, winRate: 52 },
  { rank: 8, name: 'Канонир Пушкин', wins: 54, losses: 71, winRate: 43 },
];

export default function Rating({ onNavigate }: RatingProps) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <Button 
          onClick={() => onNavigate('home')}
          variant="outline"
          className="mb-6"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад
        </Button>
        
        <h1 className="text-4xl font-bold mb-2 text-center">
          # РЕЙТИНГ ИГРОКОВ
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          ════════════════════════════════
        </p>
        
        <Card className="border-2 border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-border bg-muted/50">
                <TableHead className="font-bold text-foreground text-center w-16">#</TableHead>
                <TableHead className="font-bold text-foreground">ИМЯ ИГРОКА</TableHead>
                <TableHead className="font-bold text-foreground text-center">ПОБЕДЫ</TableHead>
                <TableHead className="font-bold text-foreground text-center">ПОРАЖЕНИЯ</TableHead>
                <TableHead className="font-bold text-foreground text-center">ПРОЦЕНТ ПОБЕД</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRatings.map((player) => (
                <TableRow 
                  key={player.rank}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="text-center font-bold">
                    {player.rank === 1 && '🥇'}
                    {player.rank === 2 && '🥈'}
                    {player.rank === 3 && '🥉'}
                    {player.rank > 3 && player.rank}
                  </TableCell>
                  <TableCell className="font-bold">{player.name}</TableCell>
                  <TableCell className="text-center text-secondary font-bold">{player.wins}</TableCell>
                  <TableCell className="text-center text-destructive font-bold">{player.losses}</TableCell>
                  <TableCell className="text-center font-bold">{player.winRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Играйте больше, чтобы попасть в топ рейтинга!
          </p>
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
