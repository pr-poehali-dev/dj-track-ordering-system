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
  playlist: 'https://functions.poehali.dev/49c9500f-f690-4ad8-989e-5b4b14218fcf'
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
  created_at: string;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [newTrack, setNewTrack] = useState({ track_name: '', artist: '' });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem('adminAuth');
    if (stored) {
      setAdminPassword(stored);
      setIsAuthenticated(true);
      loadOrders(stored);
      loadSettings(stored);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem('adminAuth', password);
    setAdminPassword(password);
    setIsAuthenticated(true);
    loadOrders(password);
    loadSettings(password);
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
