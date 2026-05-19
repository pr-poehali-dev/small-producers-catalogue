import { useState } from 'react';
import { CATEGORIES, REGIONS } from '@/data/mockData';
import Icon from '@/components/ui/icon';

interface ManufacturerCabinetProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type Tab = 'profile' | 'products' | 'status';

const mockProfile = {
  brand: 'Моя мастерская',
  name: 'Иван Иванов',
  region: 'Москва',
  category: 'home',
  description: '',
  story: '',
  phone: '',
  email: '',
  telegram: '',
  status: 'pending' as 'pending' | 'approved' | 'rejected',
};

export default function ManufacturerCabinet({ onNavigate }: ManufacturerCabinetProps) {
  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState(mockProfile);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const statusInfo = {
    pending: { label: 'На модерации', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: 'Clock' },
    approved: { label: 'Одобрен', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30', icon: 'CheckCircle' },
    rejected: { label: 'Отклонён', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', icon: 'XCircle' },
  };

  const status = statusInfo[profile.status];

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold">Кабинет производителя</h1>
            <p className="text-muted-foreground mt-1">Заполните профиль для прохождения модерации</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${status.bg} ${status.color}`}>
            <Icon name={status.icon} fallback="Clock" size={15} />
            {status.label}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8">
          {([
            { id: 'profile', label: 'Профиль', icon: 'User' },
            { id: 'products', label: 'Товары', icon: 'Package' },
            { id: 'status', label: 'Статус заявки', icon: 'ClipboardCheck' },
          ] as { id: Tab; label: string; icon: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={t.icon} fallback="Circle" size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-5">Информация о бренде</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Название бренда *</label>
                  <input
                    type="text"
                    value={profile.brand}
                    onChange={e => setProfile({ ...profile, brand: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                    placeholder="Например: WoodMaster"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Ваше имя *</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                    placeholder="Иван Иванов"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Регион *</label>
                  <select
                    value={profile.region}
                    onChange={e => setProfile({ ...profile, region: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                  >
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Категория *</label>
                  <select
                    value={profile.category}
                    onChange={e => setProfile({ ...profile, category: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Краткое описание *</label>
                <textarea
                  value={profile.description}
                  onChange={e => setProfile({ ...profile, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Что вы производите? Один-два предложения..."
                />
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">История бренда</label>
                <textarea
                  value={profile.story}
                  onChange={e => setProfile({ ...profile, story: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Расскажите вашу историю: как начали, что вдохновляет, как работаете..."
                />
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-5">Контакты</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Телефон</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                    placeholder="+7 (999) 000-00-00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                    placeholder="email@example.ru"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Telegram</label>
                  <input
                    type="text"
                    value={profile.telegram}
                    onChange={e => setProfile({ ...profile, telegram: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                {saved ? <><Icon name="Check" size={18} />Сохранено!</> : <><Icon name="Save" size={18} />Сохранить и отправить на модерацию</>}
              </button>
            </div>
          </div>
        )}

        {/* Products tab */}
        {tab === 'products' && (
          <div className="animate-fade-in">
            <div className="bg-card border border-border/50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold">Мои товары</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Icon name="Plus" size={16} />
                  Добавить товар
                </button>
              </div>

              <div className="text-center py-16 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Icon name="Package" size={28} className="text-muted-foreground/50" />
                </div>
                <p className="font-semibold mb-1">Пока нет товаров</p>
                <p className="text-sm">Добавьте первый товар — фото, название и цену</p>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold mb-5">Добавить товар</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Название товара *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                    placeholder="Например: Кольцо из серебра"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Цена (руб.) *</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Фото товара *</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <Icon name="Upload" size={20} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Загрузить фото</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                  <Icon name="Plus" size={16} />
                  Добавить товар
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status tab */}
        {tab === 'status' && (
          <div className="animate-fade-in space-y-4">
            <div className={`rounded-2xl border p-6 ${status.bg}`}>
              <div className="flex items-center gap-3 mb-3">
                <Icon name={status.icon} fallback="Clock" size={24} className={status.color} />
                <h2 className={`font-display text-2xl font-bold ${status.color}`}>{status.label}</h2>
              </div>
              {profile.status === 'pending' && (
                <p className="text-muted-foreground">Ваша заявка отправлена и ожидает проверки администратором. Обычно это занимает 1-2 рабочих дня. После одобрения ваш профиль появится в каталоге.</p>
              )}
              {profile.status === 'approved' && (
                <p className="text-muted-foreground">Ваш профиль одобрен и виден всем посетителям каталога. Вы можете продолжать добавлять товары.</p>
              )}
              {profile.status === 'rejected' && (
                <p className="text-muted-foreground">Ваша заявка отклонена. Пожалуйста, проверьте правильность заполнения профиля и обратитесь к администратору.</p>
              )}
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Чек-лист для одобрения</h3>
              <div className="space-y-3">
                {[
                  { label: 'Название бренда заполнено', done: !!profile.brand },
                  { label: 'Добавлено описание', done: !!profile.description },
                  { label: 'Указан регион', done: !!profile.region },
                  { label: 'Есть контактные данные', done: !!(profile.phone || profile.email || profile.telegram) },
                  { label: 'Добавлена история бренда', done: !!profile.story },
                  { label: 'Добавлен хотя бы один товар', done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500' : 'bg-muted border border-border'}`}>
                      {item.done && <Icon name="Check" size={12} className="text-white" />}
                    </div>
                    <span className={`text-sm ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
