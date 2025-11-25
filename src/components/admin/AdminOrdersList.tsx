import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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

interface AdminOrdersListProps {
  orders: Order[];
  updateOrderStatus: (orderId: number, status: string, paymentStatus: string) => void;
  deleteOrder: (orderId: number) => void;
}

export default function AdminOrdersList({ orders, updateOrderStatus, deleteOrder }: AdminOrdersListProps) {
  return (
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
              {order.payment_method === 'cash' && (
                <div className="flex items-center gap-2 text-xs p-2 rounded bg-accent/10 border border-accent/30">
                  <Icon name="Wallet" size={14} className="text-accent" />
                  <span className="text-accent font-semibold">Оплата наличными</span>
                </div>
              )}
              {order.has_celebration && (
                <div className="mt-2 p-2 rounded bg-secondary/10 border border-secondary/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="PartyPopper" size={16} className="text-secondary" />
                    <span className="text-sm font-semibold text-secondary">
                      {order.celebration_category === 'birthday' ? 'День рождения' : 'Другой праздник'}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    {order.celebration_category === 'birthday' && order.celebration_text && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Имя именинника:</span> {order.celebration_text}
                      </p>
                    )}
                    {order.celebration_category === 'other' && (
                      <>
                        {order.celebration_type && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Праздник:</span> {order.celebration_type}
                          </p>
                        )}
                        {order.celebration_text && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Доп. текст:</span> {order.celebration_text}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                {order.status === 'pending' && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'completed', order.payment_status)}
                    size="sm"
                    className="neon-box-cyan"
                  >
                    <Icon name="Check" size={16} className="mr-1" />
                    Выполнено
                  </Button>
                )}
                {order.status === 'completed' && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'pending', order.payment_status)}
                    size="sm"
                    variant="outline"
                  >
                    <Icon name="RotateCcw" size={16} className="mr-1" />
                    Вернуть
                  </Button>
                )}
                {order.payment_status === 'unpaid' && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, order.status, 'paid')}
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-500/10"
                  >
                    <Icon name="DollarSign" size={16} className="mr-1" />
                    Оплачено
                  </Button>
                )}
                <Button
                  onClick={() => deleteOrder(order.id)}
                  size="sm"
                  variant="destructive"
                  className="ml-auto"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Заказов пока нет</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
