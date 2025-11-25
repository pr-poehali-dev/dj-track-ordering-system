import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Tariff {
  id?: number;
  tariff_id: string;
  name: string;
  price: number;
  time_estimate: string;
  icon: string;
}

interface OrderFormData {
  track_name: string;
  artist: string;
  customer_name: string;
  customer_phone: string;
  tariff: string;
  has_celebration: boolean;
  celebration_category: string;
  celebration_text: string;
  celebration_type: string;
  payment_method: string;
  promo_code: string;
}

interface OrderFormSectionProps {
  isAcceptingOrders: boolean;
  tariffs: Tariff[];
  orderForm: OrderFormData;
  setOrderForm: React.Dispatch<React.SetStateAction<OrderFormData>>;
  handleOrderSubmit: (e: React.FormEvent) => Promise<void>;
  activePromoCode: string;
  promoApplied: boolean;
  setPromoApplied: React.Dispatch<React.SetStateAction<boolean>>;
  toast: any;
}

export default function OrderFormSection({
  isAcceptingOrders,
  tariffs,
  orderForm,
  setOrderForm,
  handleOrderSubmit,
  activePromoCode,
  promoApplied,
  setPromoApplied,
  toast
}: OrderFormSectionProps) {
  return (
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
  );
}
