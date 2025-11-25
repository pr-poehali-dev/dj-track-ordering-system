import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface Tariff {
  id?: number;
  tariff_id: string;
  name: string;
  price: number;
  time_estimate: string;
  icon: string;
}

interface AdminSettingsCardsProps {
  isAcceptingOrders: boolean;
  toggleAcceptingOrders: (checked: boolean) => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  editingPromo: boolean;
  setEditingPromo: (editing: boolean) => void;
  updatePromoCode: () => void;
  loadSettings: (pwd: string) => void;
  adminPassword: string;
  newTrack: { track_name: string; artist: string };
  setNewTrack: React.Dispatch<React.SetStateAction<{ track_name: string; artist: string }>>;
  addToPlaylist: () => void;
  tariffs: Tariff[];
  editingTariff: Tariff | null;
  setEditingTariff: (tariff: Tariff | null) => void;
  updateTariff: (tariff: Tariff) => void;
}

export default function AdminSettingsCards({
  isAcceptingOrders,
  toggleAcceptingOrders,
  promoCode,
  setPromoCode,
  editingPromo,
  setEditingPromo,
  updatePromoCode,
  loadSettings,
  adminPassword,
  newTrack,
  setNewTrack,
  addToPlaylist,
  tariffs,
  editingTariff,
  setEditingTariff,
  updateTariff
}: AdminSettingsCardsProps) {
  return (
    <>
      <Card className="neon-box-cyan">
        <CardHeader>
          <CardTitle>Настройки приема заказов</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Switch
            checked={isAcceptingOrders}
            onCheckedChange={toggleAcceptingOrders}
            id="accepting-orders"
          />
          <Label htmlFor="accepting-orders" className="text-lg">
            {isAcceptingOrders ? 'Прием заказов включен' : 'Прием заказов выключен'}
          </Label>
        </CardContent>
      </Card>

      <Card className="neon-box-orange">
        <CardHeader>
          <CardTitle>Промокод на бесплатный заказ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingPromo ? (
            <div className="space-y-3">
              <Input
                placeholder="Введите промокод"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="bg-card border-accent/30"
              />
              <div className="flex gap-2">
                <Button
                  onClick={updatePromoCode}
                  className="neon-box-cyan"
                >
                  Сохранить
                </Button>
                <Button
                  onClick={() => {
                    setEditingPromo(false);
                    loadSettings(adminPassword);
                  }}
                  variant="outline"
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Текущий промокод:</p>
                <p className="text-lg font-bold text-accent">{promoCode || 'Не установлен'}</p>
              </div>
              <Button
                onClick={() => setEditingPromo(true)}
                variant="outline"
              >
                <Icon name="Pencil" size={16} className="mr-2" />
                Изменить
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="neon-box-purple">
        <CardHeader>
          <CardTitle>Добавить трек в плейлист</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Название трека"
              value={newTrack.track_name}
              onChange={(e) => setNewTrack({ ...newTrack, track_name: e.target.value })}
              className="bg-card border-secondary/30"
            />
            <Input
              placeholder="Исполнитель"
              value={newTrack.artist}
              onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
              className="bg-card border-secondary/30"
            />
          </div>
          <Button onClick={addToPlaylist} className="neon-box-purple">
            <Icon name="Plus" className="mr-2" size={16} />
            Добавить в плейлист
          </Button>
        </CardContent>
      </Card>

      <Card className="neon-box-orange">
        <CardHeader>
          <CardTitle>Управление тарифами</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tariffs.map((tariff) => (
            <div
              key={tariff.tariff_id}
              className="p-4 rounded-lg bg-card border border-accent/30 space-y-3"
            >
              {editingTariff?.tariff_id === tariff.tariff_id ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Название тарифа"
                    value={editingTariff.name}
                    onChange={(e) =>
                      setEditingTariff({ ...editingTariff, name: e.target.value })
                    }
                    className="bg-card border-accent/30"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Цена"
                      value={editingTariff.price}
                      onChange={(e) =>
                        setEditingTariff({ ...editingTariff, price: parseInt(e.target.value) })
                      }
                      className="bg-card border-accent/30"
                    />
                    <Input
                      placeholder="Время (5 минут)"
                      value={editingTariff.time_estimate}
                      onChange={(e) =>
                        setEditingTariff({ ...editingTariff, time_estimate: e.target.value })
                      }
                      className="bg-card border-accent/30"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateTariff(editingTariff)}
                      className="neon-box-cyan"
                      size="sm"
                    >
                      Сохранить
                    </Button>
                    <Button
                      onClick={() => setEditingTariff(null)}
                      variant="outline"
                      size="sm"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg">{tariff.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {tariff.time_estimate} • {tariff.price} ₽
                    </p>
                  </div>
                  <Button
                    onClick={() => setEditingTariff(tariff)}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="Pencil" size={16} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
