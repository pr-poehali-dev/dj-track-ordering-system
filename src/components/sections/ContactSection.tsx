import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function ContactSection() {
  return (
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
  );
}
