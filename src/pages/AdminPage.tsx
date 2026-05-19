import { useState } from 'react';
import { MANUFACTURERS, CATEGORIES, Manufacturer } from '@/data/mockData';
import Icon from '@/components/ui/icon';

interface AdminPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = '6323183';

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const [authed, setAuthed] = useState(false);
  const [loginVal, setLoginVal] = useState('');
  const [passVal, setPassVal] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleAdminLogin = () => {
    if (loginVal.trim() === ADMIN_LOGIN && passVal.trim() === ADMIN_PASSWORD) {
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Неверный логин или пароль');
    }
  };

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(MANUFACTURERS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selected, setSelected] = useState<Manufacturer | null>(null);

  const filtered = manufacturers.filter(m => filterStatus === 'all' || m.status === filterStatus);

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setManufacturers(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const stats = {
    all: manufacturers.length,
    pending: manufacturers.filter(m => m.status === 'pending').length,
    approved: manufacturers.filter(m => m.status === 'approved').length,
    rejected: manufacturers.filter(m => m.status === 'rejected').length,
  };

  const statusBadge = (status: string) => ({
    pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
    approved: 'bg-green-400/10 text-green-400 border-green-400/30',
    rejected: 'bg-red-400/10 text-red-400 border-red-400/30',
  }[status] || '');

  const statusLabel = (status: string) => ({
    pending: 'На модерации',
    approved: 'Одобрен',
    rejected: 'Отклонён',
  }[status] || status);

  const category = (id: string) => CATEGORIES.find(c => c.id === id);

  if (!authed) {
    return (
      <div className="min-h-screen pt-20 bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="ShieldCheck" size={26} className="text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold">Вход для администратора</h1>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            {loginError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{loginError}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Логин</label>
                <input type="text" value={loginVal} onChange={e => setLoginVal(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors" placeholder="admin" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Пароль</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={passVal} onChange={e => setPassVal(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors pr-10"
                    onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <Icon name={showPass ? 'EyeOff' : 'Eye'} size={16} />
                  </button>
                </div>
              </div>
              <button onClick={handleAdminLogin} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                Войти
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <button onClick={() => onNavigate('home')} className="hover:text-foreground transition-colors">Главная</button>
              <Icon name="ChevronRight" size={14} />
              <span className="text-foreground">Панель администратора</span>
            </div>
            <h1 className="font-display text-4xl font-bold">Панель администратора</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
            <Icon name="ShieldCheck" size={15} />
            Администратор
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: 'all', label: 'Всего', icon: 'Users', color: 'text-foreground' },
            { key: 'pending', label: 'На проверке', icon: 'Clock', color: 'text-yellow-400' },
            { key: 'approved', label: 'Одобрено', icon: 'CheckCircle', color: 'text-green-400' },
            { key: 'rejected', label: 'Отклонено', icon: 'XCircle', color: 'text-red-400' },
          ].map(stat => (
            <button
              key={stat.key}
              onClick={() => setFilterStatus(stat.key as typeof filterStatus)}
              className={`bg-card border rounded-2xl p-4 text-left card-hover transition-all ${filterStatus === stat.key ? 'border-primary shadow-lg shadow-primary/10' : 'border-border/50'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon name={stat.icon} fallback="Circle" size={16} className={stat.color} />
                <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              </div>
              <p className={`font-display text-3xl font-bold ${stat.color}`}>{stats[stat.key as keyof typeof stats]}</p>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">{filtered.length} производителей</p>
            </div>
            {filtered.map(m => {
              const cat = category(m.category);
              return (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className={`w-full bg-card border rounded-2xl p-4 text-left card-hover transition-all ${selected?.id === m.id ? 'border-primary' : 'border-border/50'}`}
                >
                  <div className="flex items-start gap-3">
                    <img src={m.photo} alt={m.brand} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">{m.brand}</p>
                        <span className={`px-2 py-0.5 rounded-full border text-xs font-medium flex-shrink-0 ${statusBadge(m.status)}`}>
                          {statusLabel(m.status)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{m.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{cat?.emoji} {cat?.label}</span>
                        <span>·</span>
                        <Icon name="MapPin" size={10} />
                        <span>{m.region}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Inbox" size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Нет производителей в этой категории</p>
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-card border border-border/50 rounded-2xl overflow-hidden sticky top-24 animate-scale-in">
                <div className="relative h-48 overflow-hidden">
                  <img src={selected.photo} alt={selected.brand} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <p className="text-white font-display text-2xl font-bold">{selected.brand}</p>
                      <p className="text-white/70 text-sm">{selected.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-sm font-medium ${statusBadge(selected.status)}`}>
                      {statusLabel(selected.status)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Категория</p>
                      <p className="font-medium">{category(selected.category)?.emoji} {category(selected.category)?.label}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Регион</p>
                      <p className="font-medium">{selected.region}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Контакт</p>
                      <p className="font-medium">{selected.contacts.phone || selected.contacts.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Товаров</p>
                      <p className="font-medium">{selected.products.length} шт.</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-muted-foreground text-sm mb-2">Описание</p>
                    <p className="text-sm">{selected.description}</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-muted-foreground text-sm mb-2">История бренда</p>
                    <p className="text-sm leading-relaxed">{selected.story}</p>
                  </div>

                  {/* Products preview */}
                  <div className="mb-6">
                    <p className="text-muted-foreground text-sm mb-3">Товары ({selected.products.length})</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selected.products.map(p => (
                        <div key={p.id} className="flex-shrink-0 w-20">
                          <img src={p.image} alt={p.name} className="w-20 h-20 rounded-xl object-cover" />
                          <p className="text-xs text-muted-foreground mt-1 truncate">{p.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selected.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateStatus(selected.id, 'approved')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                      >
                        <Icon name="CheckCircle" size={18} />
                        Одобрить
                      </button>
                      <button
                        onClick={() => updateStatus(selected.id, 'rejected')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
                      >
                        <Icon name="XCircle" size={18} />
                        Отклонить
                      </button>
                    </div>
                  )}

                  {selected.status === 'approved' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => onNavigate('manufacturer', { id: selected.id })}
                        className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                      >
                        Открыть страницу
                      </button>
                      <button
                        onClick={() => updateStatus(selected.id, 'rejected')}
                        className="flex items-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
                      >
                        <Icon name="Ban" size={16} />
                        Заблокировать
                      </button>
                    </div>
                  )}

                  {selected.status === 'rejected' && (
                    <button
                      onClick={() => updateStatus(selected.id, 'approved')}
                      className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                    >
                      Одобрить повторно
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-2xl flex items-center justify-center h-64 text-center">
                <div>
                  <Icon name="MousePointerClick" size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                  <p className="font-medium text-muted-foreground">Выберите производителя слева</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">для просмотра и модерации</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}