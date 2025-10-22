import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Context';
import Icon from '@/components/ui/icon';

export default function WalletConnectButton() {
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();

  if (isConnected && account) {
    return (
      <Button
        onClick={disconnectWallet}
        variant="outline"
        className="gap-2"
      >
        <Icon name="Wallet" size={16} />
        {account.slice(0, 6)}...{account.slice(-4)}
        <Icon name="LogOut" size={14} />
      </Button>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      variant="default"
      className="gap-2"
    >
      <Icon name="Wallet" size={16} />
      Подключить кошелёк
    </Button>
  );
}
