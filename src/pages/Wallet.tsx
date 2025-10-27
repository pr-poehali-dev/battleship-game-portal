import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/contexts/WalletContext';
import { useWeb3 } from '@/contexts/Web3Context';
import WalletConnectButton from '@/components/WalletConnectButton';
import { useToast } from '@/hooks/use-toast';

interface WalletProps {
  onNavigate: (page: string) => void;
}

export default function Wallet({ onNavigate }: WalletProps) {
  const { coins, addCoins, removeCoins } = useWallet();
  const { account, balance, isConnected } = useWeb3();
  const { toast } = useToast();
  
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const COIN_PACKAGES = [
    { coins: 10000, price: 0.001, label: 'Стартовый', icon: '🥉' },
    { coins: 50000, price: 0.0045, label: 'Базовый', icon: '🥈', bonus: '+10%' },
    { coins: 100000, price: 0.008, label: 'Премиум', icon: '🥇', bonus: '+20%' },
    { coins: 500000, price: 0.035, label: 'Элитный', icon: '💎', bonus: '+30%' },
  ];

  const handleBuyPackage = async (pkg: typeof COIN_PACKAGES[0]) => {
    if (!isConnected) {
      toast({
        title: 'Ошибка',
        description: 'Сначала подключите криптокошелёк',
        variant: 'destructive',
      });
      return;
    }

    if (balance && parseFloat(balance) < pkg.price) {
      toast({
        title: 'Недостаточно средств',
        description: 'На вашем кошельке недостаточно ETH',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setSelectedPackage(pkg.coins);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addCoins(pkg.coins);
      
      toast({
        title: 'Покупка успешна! 🎉',
        description: `Вы получили ${pkg.coins.toLocaleString()} монет${pkg.bonus ? ' ' + pkg.bonus : ''}`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить транзакцию',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected) {
      toast({
        title: 'Ошибка',
        description: 'Сначала подключите криптокошелёк',
        variant: 'destructive',
      });
      return;
    }

    const coinsAmount = parseFloat(withdrawAmount);
    if (isNaN(coinsAmount) || coinsAmount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректную сумму',
        variant: 'destructive',
      });
      return;
    }

    if (coinsAmount < 10000) {
      toast({
        title: 'Минимальный вывод',
        description: 'Минимальная сумма для вывода - 10,000 монет',
        variant: 'destructive',
      });
      return;
    }

    if (coins < coinsAmount) {
      toast({
        title: 'Недостаточно средств',
        description: 'У вас недостаточно игровых монет',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ethAmount = coinsAmount / 10000;
      removeCoins(coinsAmount);
      
      toast({
        title: 'Вывод успешен! 💸',
        description: `Выведено ${ethAmount.toFixed(6)} ETH на ваш кошелёк`,
      });
      
      setWithdrawAmount('');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить транзакцию',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          onClick={() => onNavigate('profile')}
          variant="outline"
          className="mb-6"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад
        </Button>
        
        <h1 className="text-4xl font-bold mb-2 text-center">
          # КРИПТО КОШЕЛЁК
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          ════════════════════════════════
        </p>

        <div className="flex justify-center mb-6">
          <WalletConnectButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 border-2 border-border bg-secondary">
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <div className="text-sm text-muted-foreground font-bold">ИГРОВОЙ БАЛАНС</div>
              <div className="text-3xl font-bold">{coins.toLocaleString()} монет</div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-border bg-secondary">
            <div className="text-center">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-sm text-muted-foreground font-bold">КРИПТО БАЛАНС</div>
              <div className="text-3xl font-bold">
                {isConnected ? `${parseFloat(balance || '0').toFixed(4)} ETH` : 'Не подключен'}
              </div>
            </div>
          </Card>
        </div>

        {isConnected && (
          <>
            <Card className="p-6 border-2 border-border mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Wallet" size={20} />
                <span className="font-bold text-sm">Адрес кошелька:</span>
              </div>
              <div className="bg-muted p-3 rounded font-mono text-sm break-all border-2 border-border">
                {account}
              </div>
            </Card>

            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <Icon name="ShoppingCart" size={28} />
                КУПИТЬ МОНЕТЫ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {COIN_PACKAGES.map((pkg) => (
                  <Card 
                    key={pkg.coins}
                    className={`p-6 border-2 transition-all hover:shadow-lg ${
                      pkg.bonus ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20' : 'border-border'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-3">{pkg.icon}</div>
                      <div className="font-bold text-sm text-muted-foreground mb-2">
                        {pkg.label}
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        {pkg.coins.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">монет</div>
                      {pkg.bonus && (
                        <div className="bg-yellow-500 text-white text-xs font-bold py-1 px-2 rounded mb-3">
                          {pkg.bonus}
                        </div>
                      )}
                      <div className="text-xl font-bold text-primary mb-4">
                        {pkg.price} ETH
                      </div>
                      <Button
                        onClick={() => handleBuyPackage(pkg)}
                        disabled={isProcessing}
                        variant={pkg.bonus ? 'default' : 'outline'}
                        className="w-full font-bold"
                      >
                        {isProcessing && selectedPackage === pkg.coins ? (
                          <>
                            <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                            Покупка...
                          </>
                        ) : (
                          'КУПИТЬ'
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">

              <Card className="p-6 border-2 border-border">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="ArrowUpCircle" size={24} />
                  ВЫВЕСТИ МОНЕТЫ
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw" className="font-bold">
                      Количество монет
                    </Label>
                    <Input 
                      id="withdraw"
                      type="number"
                      placeholder="1000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="mt-2 font-bold border-2"
                    />
                    {withdrawAmount && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ≈ {(parseFloat(withdrawAmount) / 10000).toFixed(6)} ETH
                      </p>
                    )}
                  </div>
                  <div className="bg-muted p-3 rounded text-sm border-2 border-border">
                    <div className="font-bold mb-1">Минимальный вывод:</div>
                    <div>10,000 монет (0.001 ETH)</div>
                  </div>
                  <Button 
                    onClick={handleWithdraw}
                    disabled={isProcessing || !withdrawAmount}
                    variant="destructive"
                    className="w-full font-bold"
                  >
                    {isProcessing ? 'Обработка...' : 'ВЫВЕСТИ'}
                  </Button>
                </div>
              </Card>
            </div>
          </>
        )}

        {!isConnected && (
          <Card className="p-8 border-2 border-border text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4">Подключите кошелёк</h2>
            <p className="text-muted-foreground mb-6">
              Для пополнения и вывода игровых монет необходимо подключить криптокошелёк (MetaMask, Trust Wallet и др.)
            </p>
            <WalletConnectButton />
          </Card>
        )}
      </div>
    </div>
  );
}