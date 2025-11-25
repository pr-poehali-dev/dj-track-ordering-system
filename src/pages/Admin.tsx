import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import AdminSettingsCards from '@/components/admin/AdminSettingsCards';
import AdminOrdersList from '@/components/admin/AdminOrdersList';

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
    return <AdminLoginForm password={password} setPassword={setPassword} handleLogin={handleLogin} />;
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

        <AdminSettingsCards
          isAcceptingOrders={isAcceptingOrders}
          toggleAcceptingOrders={toggleAcceptingOrders}
          promoCode={promoCode}
          setPromoCode={setPromoCode}
          editingPromo={editingPromo}
          setEditingPromo={setEditingPromo}
          updatePromoCode={updatePromoCode}
          loadSettings={loadSettings}
          adminPassword={adminPassword}
          newTrack={newTrack}
          setNewTrack={setNewTrack}
          addToPlaylist={addToPlaylist}
          tariffs={tariffs}
          editingTariff={editingTariff}
          setEditingTariff={setEditingTariff}
          updateTariff={updateTariff}
        />

        <AdminOrdersList
          orders={orders}
          updateOrderStatus={updateOrderStatus}
          deleteOrder={deleteOrder}
        />
      </div>
    </div>
  );
}
