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
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const EXCHANGE_RATE = 10000;

  const handleDeposit = async () => {
    if (!isConnected) {
      toast({
        title: 'Ошибка',
        description: 'Сначала подключите криптокошелёк',
        variant: 'destructive',
      });
      return;
    }

    const ethAmount = parseFloat(depositAmount);
    if (isNaN(ethAmount) || ethAmount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректную сумму',
        variant: 'destructive',
      });
      return;
    }

    if (balance && parseFloat(balance) < ethAmount) {
      toast({
        title: 'Недостаточно средств',
        description: 'На вашем кошельке недостаточно ETH',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const coinsToAdd = Math.floor(ethAmount * EXCHANGE_RATE);
      addCoins(coinsToAdd);
      
      toast({
        title: 'Успешно!',
        description: `Пополнено ${coinsToAdd.toLocaleString()} монет`,
      });
      
      setDepositAmount('');
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
      const ethAmount = coinsAmount / EXCHANGE_RATE;
      removeCoins(coinsAmount);
      
      toast({
        title: 'Успешно!',
        description: `Выведено ${ethAmount.toFixed(6)} ETH`,
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-border">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="ArrowDownCircle" size={24} />
                  ПОПОЛНИТЬ
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deposit" className="font-bold">
                      Сумма в ETH
                    </Label>
                    <Input 
                      id="deposit"
                      type="number"
                      step="0.0001"
                      placeholder="0.001"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="mt-2 font-bold border-2"
                    />
                    {depositAmount && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ≈ {(parseFloat(depositAmount) * EXCHANGE_RATE).toLocaleString()} монет
                      </p>
                    )}
                  </div>
                  <div className="bg-muted p-3 rounded text-sm border-2 border-border">
                    <div className="font-bold mb-1">Курс обмена:</div>
                    <div>1 ETH = {EXCHANGE_RATE.toLocaleString()} монет</div>
                  </div>
                  <Button 
                    onClick={handleDeposit}
                    disabled={isProcessing || !depositAmount}
                    variant="default"
                    className="w-full font-bold"
                  >
                    {isProcessing ? 'Обработка...' : 'ПОПОЛНИТЬ'}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 border-2 border-border">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="ArrowUpCircle" size={24} />
                  ВЫВЕСТИ
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
                        ≈ {(parseFloat(withdrawAmount) / EXCHANGE_RATE).toFixed(6)} ETH
                      </p>
                    )}
                  </div>
                  <div className="bg-muted p-3 rounded text-sm border-2 border-border">
                    <div className="font-bold mb-1">Минимальная сумма:</div>
                    <div>1,000 монет (0.0001 ETH)</div>
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
