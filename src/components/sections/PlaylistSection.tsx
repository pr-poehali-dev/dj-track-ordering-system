import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Track {
  id: number;
  track_name: string;
  artist: string;
  is_playing: boolean;
  added_at: string;
}

interface PlaylistSectionProps {
  playlist: Track[];
}

export default function PlaylistSection({ playlist }: PlaylistSectionProps) {
  return (
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
  );
}
