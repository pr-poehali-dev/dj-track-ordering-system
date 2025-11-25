import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Tariff {
  id?: number;
  tariff_id: string;
  name: string;
  price: number;
  time_estimate: string;
  icon: string;
}

interface PricingSectionProps {
  tariffs: Tariff[];
  scrollToSection: (id: string) => void;
}

export default function PricingSection({ tariffs, scrollToSection }: PricingSectionProps) {
  return (
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
  );
}
