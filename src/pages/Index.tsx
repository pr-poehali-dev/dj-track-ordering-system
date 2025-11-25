import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const BACKEND_URLS = {
  orders: 'https://functions.poehali.dev/3dc2e3de-2054-4223-9dd4-5e482efa2dec',
  settings: 'https://functions.poehali.dev/2dbf8e4a-2787-45fe-b10d-8bb9908d6e72',
  playlist: 'https://functions.poehali.dev/49c9500f-f690-4ad8-989e-5b4b14218fcf'
};

interface Track {
  id: number;
  track_name: string;
  artist: string;
  is_playing: boolean;
  added_at: string;
}

const TARIFFS = [
  { id: 'express', name: 'Экспресс', price: 1500, time: '5 минут', icon: 'Zap' },
  { id: 'standard', name: 'Стандарт', price: 500, time: '15 минут', icon: 'Music' },
  { id: 'economy', name: 'Эконом', price: 200, time: '30 минут', icon: 'Clock' }
];

export default function Index() {
  const [activeSection, setActiveSection] = useState('home');
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [orderForm, setOrderForm] = useState({
    track_name: '',
    artist: '',
    customer_name: '',
    customer_phone: '',
    tariff: 'standard'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    loadPlaylist();
    const interval = setInterval(loadPlaylist, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(BACKEND_URLS.settings);
      const data = await response.json();
      setIsAcceptingOrders(data.is_accepting_orders);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadPlaylist = async () => {
    try {
      const response = await fetch(BACKEND_URLS.playlist);
      const data = await response.json();
      setPlaylist(data);
    } catch (error) {
      console.error('Error loading playlist:', error);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAcceptingOrders) {
      toast({ title: 'Прием заказов временно приостановлен', variant: 'destructive' });
      return;
    }

    const selectedTariff = TARIFFS.find(t => t.id === orderForm.tariff);
    
    try {
      const response = await fetch(BACKEND_URLS.orders, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderForm,
          price: selectedTariff?.price || 500
        })
      });

      if (response.ok) {
        toast({ title: 'Заказ принят!', description: 'Скоро ваш трек зазвучит' });
        setOrderForm({
          track_name: '',
          artist: '',
          customer_name: '',
          customer_phone: '',
          tariff: 'standard'
        });
      } else {
        toast({ title: 'Ошибка создания заказа', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-primary/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold neon-glow-cyan">DJ Station</h1>
          <div className="hidden md:flex gap-6">
            {['home', 'order', 'playlist', 'pricing', 'contact'].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`transition-colors ${
                  activeSection === section ? 'text-primary neon-glow-cyan' : 'text-muted-foreground'
                }`}
              >
                {section === 'home' && 'Главная'}
                {section === 'order' && 'Заказать'}
                {section === 'playlist' && 'Плейлист'}
                {section === 'pricing' && 'Цены'}
                {section === 'contact' && 'Контакты'}
              </button>
            ))}
          </div>
          <Link to="/admin">
            <Button variant="outline" size="sm" className="neon-box-purple">
              <Icon name="Settings" size={16} />
            </Button>
          </Link>
        </div>
      </nav>

      <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="text-center space-y-6 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold neon-glow-purple animate-pulse">
            DJ Station
          </h1>
          <p className="text-xl md:text-2xl text-primary neon-glow-cyan">
            Заказывай любимые треки прямо сейчас
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => scrollToSection('order')}
              className="neon-box-cyan text-lg"
            >
              <Icon name="Music" className="mr-2" />
              Заказать трек
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection('playlist')}
              className="neon-box-purple text-lg"
            >
              <Icon name="ListMusic" className="mr-2" />
              Плейлист
            </Button>
          </div>
        </div>
      </section>

      <section id="order" className="min-h-screen flex items-center justify-center px-6 py-20">
        <Card className="w-full max-w-2xl neon-box-cyan">
          <CardHeader>
            <CardTitle className="text-3xl neon-glow-cyan">Заказать трек</CardTitle>
            <CardDescription>
              {isAcceptingOrders ? 'Заполните форму и ваш трек зазвучит в эфире' : 'Прием заказов временно приостановлен'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Название трека</Label>
                <Input
                  required
                  placeholder="Название"
                  value={orderForm.track_name}
                  onChange={(e) => setOrderForm({ ...orderForm, track_name: e.target.value })}
                  className="bg-card border-primary/30"
                  disabled={!isAcceptingOrders}
                />
              </div>

              <div className="space-y-2">
                <Label>Исполнитель</Label>
                <Input
                  required
                  placeholder="Имя исполнителя"
                  value={orderForm.artist}
                  onChange={(e) => setOrderForm({ ...orderForm, artist: e.target.value })}
                  className="bg-card border-primary/30"
                  disabled={!isAcceptingOrders}
                />
              </div>

              <div className="space-y-2">
                <Label>Ваше имя</Label>
                <Input
                  required
                  placeholder="Как вас представить?"
                  value={orderForm.customer_name}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                  className="bg-card border-primary/30"
                  disabled={!isAcceptingOrders}
                />
              </div>

              <div className="space-y-2">
                <Label>Телефон (необязательно)</Label>
                <Input
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={orderForm.customer_phone}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_phone: e.target.value })}
                  className="bg-card border-primary/30"
                  disabled={!isAcceptingOrders}
                />
              </div>

              <div className="space-y-2">
                <Label>Выберите тариф</Label>
                <RadioGroup
                  value={orderForm.tariff}
                  onValueChange={(value) => setOrderForm({ ...orderForm, tariff: value })}
                  disabled={!isAcceptingOrders}
                >
                  {TARIFFS.map((tariff) => (
                    <div
                      key={tariff.id}
                      className="flex items-center space-x-2 p-4 rounded-lg border border-primary/30 bg-card hover:border-primary/60 transition-colors"
                    >
                      <RadioGroupItem value={tariff.id} id={tariff.id} />
                      <Label htmlFor={tariff.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Icon name={tariff.icon as any} className="text-primary" />
                            <span className="font-semibold">{tariff.name}</span>
                            <span className="text-sm text-muted-foreground">~ {tariff.time}</span>
                          </div>
                          <span className="text-accent font-bold">{tariff.price} ₽</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full neon-box-cyan text-lg"
                size="lg"
                disabled={!isAcceptingOrders}
              >
                {isAcceptingOrders ? 'Заказать и оплатить' : 'Прием заказов приостановлен'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section id="playlist" className="min-h-screen flex items-center justify-center px-6 py-20">
        <Card className="w-full max-w-2xl neon-box-purple">
          <CardHeader>
            <CardTitle className="text-3xl neon-glow-purple">Текущий плейлист</CardTitle>
            <CardDescription>Последние треки в эфире</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {playlist.map((track) => (
                <div
                  key={track.id}
                  className={`p-4 rounded-lg border transition-all ${
                    track.is_playing
                      ? 'bg-secondary/20 border-secondary neon-box-purple'
                      : 'bg-card border-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {track.is_playing && (
                        <Icon name="Radio" className="text-secondary animate-pulse" />
                      )}
                      <div>
                        <p className="font-semibold text-primary">{track.track_name}</p>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>
                    </div>
                    {track.is_playing && (
                      <span className="text-xs text-secondary neon-glow-purple">Сейчас играет</span>
                    )}
                  </div>
                </div>
              ))}
              {playlist.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Плейлист обновляется...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="pricing" className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-6xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold neon-glow-orange">Цены и тарифы</h2>
            <p className="text-muted-foreground">Выбери удобный для тебя тариф</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TARIFFS.map((tariff) => (
              <Card key={tariff.id} className="neon-box-orange">
                <CardHeader>
                  <Icon name={tariff.icon as any} className="text-accent w-12 h-12 mb-4" />
                  <CardTitle className="text-2xl">{tariff.name}</CardTitle>
                  <CardDescription>Ваш трек в эфире через {tariff.time}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-4xl font-bold text-accent">{tariff.price} ₽</p>
                    <Button
                      className="w-full neon-box-orange"
                      onClick={() => scrollToSection('order')}
                    >
                      Заказать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="min-h-screen flex items-center justify-center px-6 py-20">
        <Card className="w-full max-w-2xl neon-box-cyan">
          <CardHeader>
            <CardTitle className="text-3xl neon-glow-cyan">Контакты</CardTitle>
            <CardDescription>Свяжись с диджеем</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-primary/30">
              <Icon name="Phone" className="text-primary" />
              <div>
                <p className="font-semibold">Телефон</p>
                <p className="text-muted-foreground">+7 (999) 123-45-67</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-primary/30">
              <Icon name="Mail" className="text-primary" />
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-muted-foreground">dj@station.ru</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-primary/30">
              <Icon name="Instagram" className="text-primary" />
              <div>
                <p className="font-semibold">Instagram</p>
                <p className="text-muted-foreground">@dj_station</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="py-8 text-center border-t border-primary/20">
        <p className="text-muted-foreground">© 2024 DJ Station. Все права защищены.</p>
      </footer>
    </div>
  );
}
