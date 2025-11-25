import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const BACKEND_URLS = {
  orders: 'https://functions.poehali.dev/3dc2e3de-2054-4223-9dd4-5e482efa2dec',
  settings: 'https://functions.poehali.dev/2dbf8e4a-2787-45fe-b10d-8bb9908d6e72',
  playlist: 'https://functions.poehali.dev/49c9500f-f690-4ad8-989e-5b4b14218fcf',
  tariffs: 'https://functions.poehali.dev/30271522-ad34-475a-a13a-bbede9385816'
};

interface Order {
  id: number;
  track_name: string;
  artist: string;
  customer_name: string;
  customer_phone: string;
  tariff: string;
  price: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  has_celebration?: boolean;
  celebration_category?: string;
  celebration_text?: string;
  celebration_type?: string;
  created_at: string;
}

interface Tariff {
  id?: number;
  tariff_id: string;
  name: string;
  price: number;
  time_estimate: string;
  icon: string;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [editingPromo, setEditingPromo] = useState(false);
  const [newTrack, setNewTrack] = useState({ track_name: '', artist: '' });
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem('adminAuth');
    if (stored) {
      setAdminPassword(stored);
      setIsAuthenticated(true);
      loadOrders(stored);
      loadSettings(stored);
      loadTariffs();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem('adminAuth', password);
    setAdminPassword(password);
    setIsAuthenticated(true);
    loadOrders(password);
    loadSettings(password);
    loadTariffs();
    toast({ title: 'Вход выполнен' });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setAdminPassword('');
    setPassword('');
    navigate('/');
  };

  const loadOrders = async (pwd: string) => {
    try {
      const response = await fetch(BACKEND_URLS.orders, {
        headers: { 'X-Admin-Auth': pwd }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast({ title: 'Ошибка загрузки заказов', variant: 'destructive' });
    }
  };

  const loadSettings = async (pwd: string) => {
    try {
      const response = await fetch(BACKEND_URLS.settings, {
        headers: { 'X-Admin-Auth': pwd }
      });
      const data = await response.json();
      setIsAcceptingOrders(data.is_accepting_orders);
      setPromoCode(data.promo_code || '');
    } catch (error) {
      toast({ title: 'Ошибка загрузки настроек', variant: 'destructive' });
    }
  };

  const toggleAcceptingOrders = async (checked: boolean) => {
    try {
      const response = await fetch(BACKEND_URLS.settings, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': adminPassword
        },
        body: JSON.stringify({ is_accepting_orders: checked })
      });

      if (response.ok) {
        setIsAcceptingOrders(checked);
        toast({ title: checked ? 'Прием заказов включен' : 'Прием заказов выключен' });
      } else {
        toast({ title: 'Ошибка изменения настроек', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  const addToPlaylist = async () => {
    if (!newTrack.track_name || !newTrack.artist) {
      toast({ title: 'Заполните название и исполнителя', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(BACKEND_URLS.playlist, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': adminPassword
        },
        body: JSON.stringify(newTrack)
      });

      if (response.ok) {
        toast({ title: 'Трек добавлен в плейлист' });
        setNewTrack({ track_name: '', artist: '' });
      } else {
        toast({ title: 'Ошибка добавления трека', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  const loadTariffs = async () => {
    try {
      const response = await fetch(BACKEND_URLS.tariffs);
      const data = await response.json();
      setTariffs(data);
    } catch (error) {
      toast({ title: 'Ошибка загрузки тарифов', variant: 'destructive' });
    }
  };

  const updateTariff = async (tariff: Tariff) => {
    try {
      const response = await fetch(BACKEND_URLS.tariffs, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': adminPassword
        },
        body: JSON.stringify(tariff)
      });

      if (response.ok) {
        toast({ title: 'Тариф обновлен' });
        loadTariffs();
        setEditingTariff(null);
      } else {
        toast({ title: 'Ошибка обновления тарифа', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  const updateOrderStatus = async (orderId: number, status: string, paymentStatus: string) => {
    try {
      const response = await fetch(BACKEND_URLS.orders, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': adminPassword
        },
        body: JSON.stringify({ id: orderId, status, payment_status: paymentStatus })
      });

      if (response.ok) {
        toast({ title: 'Статус заказа обновлен' });
        loadOrders(adminPassword);
      } else {
        toast({ title: 'Ошибка обновления статуса', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  const updatePromoCode = async () => {
    try {
      const response = await fetch(BACKEND_URLS.settings, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': adminPassword
        },
        body: JSON.stringify({ promo_code: promoCode })
      });

      if (response.ok) {
        toast({ title: 'Промокод обновлён' });
        setEditingPromo(false);
      } else {
        toast({ title: 'Ошибка обновления промокода', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm('Удалить этот заказ?')) return;

    try {
      const response = await fetch(`${BACKEND_URLS.orders}?id=${orderId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Auth': adminPassword
        }
      });

      if (response.ok) {
        toast({ title: 'Заказ удален' });
        loadOrders(adminPassword);
      } else {
        toast({ title: 'Ошибка удаления заказа', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md neon-box-cyan">
          <CardHeader>
            <CardTitle className="text-3xl font-bold neon-glow-cyan">Админ-панель</CardTitle>
            <CardDescription>Введите пароль для доступа</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-card border-primary/30"
              />
              <Button type="submit" className="w-full neon-box-cyan">
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold neon-glow-purple">Админ-панель</h1>
          <Button onClick={handleLogout} variant="outline">
            <Icon name="LogOut" className="mr-2" size={16} />
            Выйти
          </Button>
        </div>

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

        <Card className="neon-box-orange">
          <CardHeader>
            <CardTitle>Заказы треков ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-lg bg-card border border-accent/30 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg text-primary">{order.track_name}</p>
                      <p className="text-muted-foreground">{order.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-accent font-bold">{order.price} ₽</p>
                      <p className="text-sm text-muted-foreground">{order.tariff}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{order.customer_name}</span>
                    <span className="text-muted-foreground">{order.customer_phone}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Статус: {order.status}</span>
                    <span>Оплата: {order.payment_status}</span>
                  </div>
                  {order.payment_method === 'cash' && (
                    <div className="flex items-center gap-2 text-xs p-2 rounded bg-accent/10 border border-accent/30">
                      <Icon name="Wallet" size={14} className="text-accent" />
                      <span className="text-accent font-semibold">Оплата наличными</span>
                    </div>
                  )}
                  {order.has_celebration && (
                    <div className="mt-2 p-2 rounded bg-secondary/10 border border-secondary/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="PartyPopper" size={16} className="text-secondary" />
                        <span className="text-sm font-semibold text-secondary">
                          {order.celebration_category === 'birthday' ? 'День рождения' : 'Другой праздник'}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        {order.celebration_category === 'birthday' && order.celebration_text && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Имя именинника:</span> {order.celebration_text}
                          </p>
                        )}
                        {order.celebration_category === 'other' && (
                          <>
                            {order.celebration_type && (
                              <p className="text-muted-foreground">
                                <span className="font-medium">Праздник:</span> {order.celebration_type}
                              </p>
                            )}
                            {order.celebration_text && (
                              <p className="text-muted-foreground">
                                <span className="font-medium">Доп. текст:</span> {order.celebration_text}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    {order.status === 'pending' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'completed', order.payment_status)}
                        size="sm"
                        className="neon-box-cyan"
                      >
                        <Icon name="Check" size={16} className="mr-1" />
                        Выполнено
                      </Button>
                    )}
                    {order.status === 'completed' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'pending', order.payment_status)}
                        size="sm"
                        variant="outline"
                      >
                        <Icon name="RotateCcw" size={16} className="mr-1" />
                        Вернуть
                      </Button>
                    )}
                    {order.payment_status === 'unpaid' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, order.status, 'paid')}
                        size="sm"
                        variant="outline"
                        className="border-green-500 text-green-500 hover:bg-green-500/10"
                      >
                        <Icon name="DollarSign" size={16} className="mr-1" />
                        Оплачено
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteOrder(order.id)}
                      size="sm"
                      variant="destructive"
                      className="ml-auto"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Заказов пока нет</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}