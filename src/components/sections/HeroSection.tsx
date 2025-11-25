import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface HeroSectionProps {
  scrollToSection: (id: string) => void;
}

export default function HeroSection({ scrollToSection }: HeroSectionProps) {
  return (
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
  );
}
