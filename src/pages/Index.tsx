import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const BACKEND_URLS = {
  orders: 'https://functions.poehali.dev/3dc2e3de-2054-4223-9dd4-5e482efa2dec',
  settings: 'https://functions.poehali.dev/2dbf8e4a-2787-45fe-b10d-8bb9908d6e72',
  playlist: 'https://functions.poehali.dev/49c9500f-f690-4ad8-989e-5b4b14218fcf',
  tariffs: 'https://functions.poehali.dev/30271522-ad34-475a-a13a-bbede9385816'
};

interface Track {
  id: number;
  track_name: string;
  artist: string;
  is_playing: boolean;
  added_at: string;
}

interface Tariff {
  id?: number;
  tariff_id: string;
  name: string;
  price: number;
  time_estimate: string;
  icon: string;
}

export default function Index() {
  const [activeSection, setActiveSection] = useState('home');
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [activePromoCode, setActivePromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [orderForm, setOrderForm] = useState({
    track_name: '',
    artist: '',
    customer_name: '',
    customer_phone: '',
    tariff: 'standard',
    has_celebration: false,
    celebration_category: 'birthday',
    celebration_text: '',
    celebration_type: '',
    payment_method: 'online',
    promo_code: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    loadPlaylist();
    loadTariffs();
    const interval = setInterval(loadPlaylist, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(BACKEND_URLS.settings);
      const data = await response.json();
      setIsAcceptingOrders(data.is_accepting_orders);
      setActivePromoCode(data.promo_code || '');
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

  const loadTariffs = async () => {
    try {
      const response = await fetch(BACKEND_URLS.tariffs);
      const data = await response.json();
      setTariffs(data);
    } catch (error) {
      console.error('Error loading tariffs:', error);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAcceptingOrders) {
      toast({ title: 'Прием заказов временно приостановлен', variant: 'destructive' });
      return;
    }

    const selectedTariff = tariffs.find(t => t.tariff_id === orderForm.tariff);
    let totalPrice = selectedTariff?.price || 500;
    if (orderForm.has_celebration) {
      totalPrice += 100;
    }
    
    if (promoApplied && activePromoCode && orderForm.promo_code.toLowerCase() === activePromoCode.toLowerCase()) {
      totalPrice = 0;
    }
    
    try {
      const response = await fetch(BACKEND_URLS.orders, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderForm,
          price: totalPrice
        })
      });

      if (response.ok) {
        toast({ title: 'Заказ принят!', description: 'Скоро ваш трек зазвучит' });
        setOrderForm({
          track_name: '',
          artist: '',
          customer_name: '',
          customer_phone: '',
          tariff: 'standard',
          has_celebration: false,
          celebration_category: 'birthday',
          celebration_text: '',
          celebration_type: '',
          payment_method: 'online',
          promo_code: ''
        });
        setPromoApplied(false);
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
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold neon-glow-cyan">DJ Station</h1>
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

      <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="text-center space-y-6 max-w-4xl">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold neon-glow-purple animate-pulse">
            DJ Station
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-primary neon-glow-cyan">
            Заказывай любимые треки прямо сейчас
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => scrollToSection('order')}
              className="neon-box-cyan text-base sm:text-lg"
            >
              <Icon name="Music" className="mr-2" size={20} />
              Заказать трек
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection('playlist')}
              className="neon-box-purple text-base sm:text-lg"
            >
              <Icon name="ListMusic" className="mr-2" size={20} />
              Плейлист
            </Button>
          </div>
        </div>
      </section>

      <section id="order" className="min-h-screen flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-2xl neon-box-cyan">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl neon-glow-cyan">Заказать трек</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {isAcceptingOrders ? 'Заполните форму и ваш трек зазвучит в эфире' : 'Прием заказов временно приостановлен'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOrderSubmit} className="space-y-4 sm:space-y-6">
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
                  {tariffs.map((tariff) => (
                    <div
                      key={tariff.tariff_id}
                      className="flex items-center space-x-2 p-3 sm:p-4 rounded-lg border border-primary/30 bg-card hover:border-primary/60 transition-colors"
                    >
                      <RadioGroupItem value={tariff.tariff_id} id={tariff.tariff_id} />
                      <Label htmlFor={tariff.tariff_id} className="flex-1 cursor-pointer">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                          <div className="flex items-center gap-2">
                            <Icon name={tariff.icon as any} className="text-primary" size={18} />
                            <span className="font-semibold text-sm sm:text-base">{tariff.name}</span>
                            <span className="text-xs sm:text-sm text-muted-foreground">~ {tariff.time_estimate}</span>
                          </div>
                          <span className="text-accent font-bold text-base sm:text-lg">{tariff.price} ₽</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4 p-4 rounded-lg border border-secondary/30 bg-card/50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="celebration"
                    checked={orderForm.has_celebration}
                    onCheckedChange={(checked) => 
                      setOrderForm({ ...orderForm, has_celebration: checked as boolean })
                    }
                    disabled={!isAcceptingOrders}
                  />
                  <Label htmlFor="celebration" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Icon name="PartyPopper" className="text-secondary" size={20} />
                      <span className="font-semibold">Поздравить с праздником</span>
                      <span className="text-accent font-bold">+100 ₽</span>
                    </div>
                  </Label>
                </div>
                {orderForm.has_celebration && (
                  <div className="space-y-3 ml-6">
                    <RadioGroup
                      value={orderForm.celebration_category}
                      onValueChange={(value) => setOrderForm({ ...orderForm, celebration_category: value, celebration_text: '', celebration_type: '' })}
                      disabled={!isAcceptingOrders}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="birthday" id="birthday" />
                        <Label htmlFor="birthday" className="cursor-pointer text-sm font-semibold">
                          День рождения
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer text-sm font-semibold">
                          Другой праздник
                        </Label>
                      </div>
                    </RadioGroup>

                    {orderForm.celebration_category === 'birthday' && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Имя именинника
                        </Label>
                        <Input
                          placeholder="Например: Алина"
                          value={orderForm.celebration_text}
                          onChange={(e) => setOrderForm({ ...orderForm, celebration_text: e.target.value })}
                          className="bg-card border-secondary/30"
                          disabled={!isAcceptingOrders}
                        />
                      </div>
                    )}

                    {orderForm.celebration_category === 'other' && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">
                            Какой праздник?
                          </Label>
                          <Input
                            placeholder="Например: Свадьба, Юбилей, Годовщина"
                            value={orderForm.celebration_type}
                            onChange={(e) => setOrderForm({ ...orderForm, celebration_type: e.target.value })}
                            className="bg-card border-secondary/30"
                            disabled={!isAcceptingOrders}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">
                            Дополнительный текст (необязательно)
                          </Label>
                          <Textarea
                            placeholder="Например: От коллег по работе, С 25-летием компании"
                            value={orderForm.celebration_text}
                            onChange={(e) => setOrderForm({ ...orderForm, celebration_text: e.target.value })}
                            className="bg-card border-secondary/30"
                            rows={2}
                            disabled={!isAcceptingOrders}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 p-3 sm:p-4 rounded-lg border border-primary/30 bg-card/50">
                <Label className="font-semibold text-sm sm:text-base">Способ оплаты</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="payment-online"
                      checked={orderForm.payment_method === 'online'}
                      onCheckedChange={(checked) => 
                        checked && setOrderForm({ ...orderForm, payment_method: 'online' })
                      }
                      disabled={!isAcceptingOrders}
                    />
                    <Label htmlFor="payment-online" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Icon name="CreditCard" className="text-primary" size={18} />
                        <span className="text-sm sm:text-base">Онлайн оплата (сразу)</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="payment-cash"
                      checked={orderForm.payment_method === 'cash'}
                      onCheckedChange={(checked) => 
                        checked && setOrderForm({ ...orderForm, payment_method: 'cash' })
                      }
                      disabled={!isAcceptingOrders}
                    />
                    <Label htmlFor="payment-cash" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Icon name="Wallet" className="text-primary" size={18} />
                        <span className="text-sm sm:text-base">Наличными диджею</span>
                      </div>
                    </Label>
                  </div>
                </div>
              </div>

              {activePromoCode && (
                <div className="space-y-2 p-3 sm:p-4 rounded-lg border border-accent/30 bg-card/50">
                  <Label className="font-semibold text-sm sm:text-base">Промокод на бесплатный заказ</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Введите промокод"
                      value={orderForm.promo_code}
                      onChange={(e) => {
                        setOrderForm({ ...orderForm, promo_code: e.target.value });
                        setPromoApplied(false);
                      }}
                      className="bg-card border-accent/30"
                      disabled={!isAcceptingOrders || promoApplied}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (orderForm.promo_code.toLowerCase() === activePromoCode.toLowerCase()) {
                          setPromoApplied(true);
                          toast({ title: 'Промокод применён!', description: 'Заказ бесплатный' });
                        } else {
                          toast({ title: 'Неверный промокод', variant: 'destructive' });
                        }
                      }}
                      disabled={!isAcceptingOrders || promoApplied || !orderForm.promo_code}
                      className="neon-box-orange"
                    >
                      {promoApplied ? 'Применён' : 'Применить'}
                    </Button>
                  </div>
                  {promoApplied && (
                    <p className="text-sm text-green-500 flex items-center gap-1">
                      <Icon name="Check" size={16} />
                      Скидка 100% активирована
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center p-3 sm:p-4 rounded-lg bg-card border border-primary/30">
                <span className="font-semibold text-sm sm:text-base">Итого к оплате:</span>
                <span className="text-xl sm:text-2xl font-bold text-accent">
                  {promoApplied ? 0 : (tariffs.find(t => t.tariff_id === orderForm.tariff)?.price || 500) + (orderForm.has_celebration ? 100 : 0)} ₽
                </span>
              </div>

              <Button
                type="submit"
                className="w-full neon-box-cyan text-base sm:text-lg"
                size="lg"
                disabled={!isAcceptingOrders}
              >
                {isAcceptingOrders ? (promoApplied ? 'Отправить бесплатный заказ' : orderForm.payment_method === 'online' ? 'Заказать и оплатить' : 'Отправить заказ') : 'Прием заказов приостановлен'}
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
            {tariffs.map((tariff) => (
              <Card key={tariff.tariff_id} className="neon-box-orange">
                <CardHeader>
                  <Icon name={tariff.icon as any} className="text-accent w-12 h-12 mb-4" />
                  <CardTitle className="text-2xl">{tariff.name}</CardTitle>
                  <CardDescription>Ваш трек в эфире через {tariff.time_estimate}</CardDescription>
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