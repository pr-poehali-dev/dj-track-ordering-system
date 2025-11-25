import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminLoginFormProps {
  password: string;
  setPassword: (password: string) => void;
  handleLogin: (e: React.FormEvent) => void;
}

export default function AdminLoginForm({ password, setPassword, handleLogin }: AdminLoginFormProps) {
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
