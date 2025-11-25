import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import HeroSection from '@/components/sections/HeroSection';
import OrderFormSection from '@/components/sections/OrderFormSection';
import PlaylistSection from '@/components/sections/PlaylistSection';
import PricingSection from '@/components/sections/PricingSection';
import ContactSection from '@/components/sections/ContactSection';

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
      } else if (response.status === 400) {
        const errorData = await response.json();
        toast({ 
          title: 'Заказ отклонён', 
          description: errorData.error || 'Этот трек не может быть заказан по правилам площадки',
          variant: 'destructive' 
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

      <HeroSection scrollToSection={scrollToSection} />

      <OrderFormSection
        isAcceptingOrders={isAcceptingOrders}
        tariffs={tariffs}
        orderForm={orderForm}
        setOrderForm={setOrderForm}
        handleOrderSubmit={handleOrderSubmit}
        activePromoCode={activePromoCode}
        promoApplied={promoApplied}
        setPromoApplied={setPromoApplied}
        toast={toast}
      />

      <PlaylistSection playlist={playlist} />

      <PricingSection tariffs={tariffs} scrollToSection={scrollToSection} />

      <ContactSection />

      <footer className="py-8 text-center border-t border-primary/20">
        <p className="text-muted-foreground">© 2024 DJ Station. Все права защищены.</p>
      </footer>
    </div>
  );
}
