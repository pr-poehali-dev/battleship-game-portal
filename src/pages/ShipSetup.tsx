import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import ShipEditor from '@/components/ShipEditor';
import { useShipLayout } from '@/contexts/ShipLayoutContext';
import { CellState } from '@/components/GameBoard';
import { useToast } from '@/hooks/use-toast';

interface ShipSetupProps {
  onNavigate: (page: string) => void;
}

export default function ShipSetup({ onNavigate }: ShipSetupProps) {
  const { layouts, selectedLayoutId, saveLayout, deleteLayout, selectLayout, updateLayoutName } = useShipLayout();
  const [isCreating, setIsCreating] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const { toast } = useToast();

  const handleSaveLayout = (board: CellState[][]) => {
    if (!newLayoutName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название расстановки',
        variant: 'destructive',
      });
      return;
    }

    saveLayout(newLayoutName, board);
    setIsCreating(false);
    setNewLayoutName('');
    
    toast({
      title: 'Сохранено!',
      description: `Расстановка "${newLayoutName}" успешно сохранена`,
    });
  };

  const handleUpdateName = (id: number) => {
    if (!editingName.trim()) return;
    updateLayoutName(id, editingName);
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: number, name: string) => {
    deleteLayout(id);
    toast({
      title: 'Удалено',
      description: `Расстановка "${name}" удалена`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            # РАССТАНОВКА КОРАБЛЕЙ
          </h1>
          <Button onClick={() => onNavigate('home')} variant="outline" className="font-bold">
            <Icon name="Home" size={16} />
            На главную
          </Button>
        </div>

        <p className="text-center text-muted-foreground mb-8">
          Создайте и сохраните до 5 вариантов расстановки кораблей
        </p>

        {!isCreating ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {layouts.map((layout) => (
                <Card key={layout.id} className={`p-4 border-2 ${
                  selectedLayoutId === layout.id ? 'border-primary' : 'border-border'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    {editingId === layout.id ? (
                      <div className="flex gap-2 flex-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="font-bold"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdateName(layout.id)}
                        >
                          <Icon name="Check" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName('');
                          }}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="font-bold text-lg">{layout.name}</div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(layout.id);
                              setEditingName(layout.name);
                            }}
                          >
                            <Icon name="Pencil" size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(layout.id, layout.name)}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-10 gap-0.5 mb-3">
                    {layout.board.map((row, i) => (
                      row.map((cell, j) => (
                        <div
                          key={`${i}-${j}`}
                          className={`w-full aspect-square border ${
                            cell === 'ship'
                              ? 'bg-primary border-primary'
                              : 'bg-secondary border-border'
                          }`}
                        />
                      ))
                    ))}
                  </div>

                  <Button
                    onClick={() => selectLayout(layout.id)}
                    variant={selectedLayoutId === layout.id ? 'default' : 'outline'}
                    className="w-full font-bold"
                  >
                    {selectedLayoutId === layout.id ? (
                      <>
                        <Icon name="Check" size={16} />
                        Выбрано
                      </>
                    ) : (
                      'Выбрать'
                    )}
                  </Button>
                </Card>
              ))}

              {layouts.length < 5 && (
                <Card className="p-4 border-2 border-dashed border-border flex items-center justify-center">
                  <Button
                    onClick={() => setIsCreating(true)}
                    variant="outline"
                    className="font-bold h-auto py-8"
                  >
                    <Icon name="Plus" size={24} />
                    Создать новую расстановку
                  </Button>
                </Card>
              )}
            </div>

            {layouts.length === 0 && (
              <Card className="p-8 text-center">
                <div className="text-muted-foreground mb-4">
                  У вас пока нет сохраненных расстановок
                </div>
                <Button onClick={() => setIsCreating(true)} className="font-bold">
                  <Icon name="Plus" size={16} />
                  Создать первую расстановку
                </Button>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-6">
            <div className="mb-4">
              <label className="block font-bold mb-2">Название расстановки:</label>
              <Input
                value={newLayoutName}
                onChange={(e) => setNewLayoutName(e.target.value)}
                placeholder="Например: Оборона, Атака, Классика..."
                className="font-bold"
              />
            </div>

            <ShipEditor onSave={handleSaveLayout} />

            <Button
              onClick={() => {
                setIsCreating(false);
                setNewLayoutName('');
              }}
              variant="outline"
              className="w-full mt-4 font-bold"
            >
              <Icon name="X" size={16} />
              Отмена
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
