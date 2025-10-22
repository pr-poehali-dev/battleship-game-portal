import { useWallet } from '@/contexts/WalletContext';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function WalletDisplay() {
  const { coins } = useWallet();
  
  return (
    <Card className="p-4 border-2 border-border bg-secondary inline-flex items-center gap-3">
      <div className="text-3xl">💰</div>
      <div>
        <div className="text-xs text-muted-foreground font-bold">БАЛАНС</div>
        <div className="text-2xl font-bold flex items-center gap-2">
          <Icon name="Coins" size={20} />
          {coins.toLocaleString()}
        </div>
      </div>
    </Card>
  );
}
