import { useState, useEffect } from 'react';
import { CATEGORIES, REGIONS } from '@/data/mockData';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';

interface ManufacturerCabinetProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type Tab = 'profile' | 'products' | 'status';
type Screen = 'auth' | 'confirm' | 'cabinet';
type AuthTab = 'login' | 'register';

export default function ManufacturerCabinet({ onNavigate }: ManufacturerCabinetProps) {
  const [screen, setScreen] = useState<Screen>('auth');
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [tab, setTab] = useState<Tab>('profile');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmToken, setConfirmToken] = useState('');
  const [devToken, setDevToken] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [user, setUser] = useState<{ user_id: number; email: string; role: string } | null>(null);
  const [profile, setProfile] = useState({
    brand: '', owner_name: '', region: 'Москва', category: 'home',
    description: '', story: '', phone: '', email: '', telegram: '', website: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    reject_reason: '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('svoe_token');
    if (token) {
      api.auth.me().then(res => {
        if (res.user_id && res.role === 'manufacturer') {
          setUser(res);
          loadProfile();
          setScreen('cabinet');
        } else {
          localStorage.removeItem('svoe_token');
        }
      }).catch(() => localStorage.removeItem('svoe_token'));
    }
  }, []);

  const loadProfile = async () => {
    const res = await api.manufacturers.my();
    if (res && res.brand) {
      setProfile({
        brand: res.brand || '',
        owner_name: res.owner_name || '',
        region: res.region || 'Москва',
        category: res.category || 'home',
        description: res.description || '',
        story: res.story || '',
        phone: res.phone || '',
        email: res.email || '',
        telegram: res.telegram || '',
        website: res.website || '',
        status: res.status || 'pending',
        reject_reason: res.reject_reason || '',
      });
    }
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.register(email, password, 'manufacturer');
      if (res.error) { setError(res.error); return; }
      setPendingEmail(email);
      setDevToken(res.confirmation_token || '');
      setScreen('confirm');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.confirmEmail(confirmToken);
      if (res.error) { setError(res.error); return; }
      setSuccess('Email подтверждён! Теперь войдите.');
      setAuthTab('login');
      setEmail(pendingEmail);
      setScreen('auth');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.error) { setError(res.error); return; }
      localStorage.setItem('svoe_token', res.token);
      setUser({ user_id: res.user_id, email: res.email, role: res.role });
      await loadProfile();
      setScreen('cabinet');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.auth.logout();
    localStorage.removeItem('svoe_token');
    setUser(null);
    setScreen('auth');
  };

  const handleSaveProfile = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.manufacturers.save(profile);
      if (res.error) { setError(res.error); return; }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
      await loadProfile();
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors";

  const statusInfo = {
    pending: { label: 'На модерации', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: 'Clock' },
    approved: { label: 'Одобрен', color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: 'CheckCircle' },
    rejected: { label: 'Отклонён', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: 'XCircle' },
  };
  const status = statusInfo[profile.status] || statusInfo.pending;

  // --- AUTH SCREEN ---
  if (screen === 'auth') {
    return (
      <div className="min-h-screen pt-20 bg-background">
        {/* Why section */}
        <section className="py-16 border-b border-border/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">Почему <span className="gradient-text">Своё</span>?</h2>
            <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">В эпоху роста тарифов маркетплейсов и блокировок соцсетей мастера теряют доступ к покупателям</p>
            <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {[
                { icon: 'TrendingDown', title: 'Без комиссий', desc: 'Маркетплейсы берут до 30% с каждой продажи. Здесь публикуетесь бесплатно и общаетесь напрямую.', color: 'text-green-600' },
                { icon: 'Shield', title: 'Проверенные мастера', desc: 'Каждый производитель проходит модерацию. Только настоящие российские мастера.', color: 'text-primary' },
                { icon: 'Map', title: 'Вся страна', desc: 'От Калининграда до Владивостока. Уникальные изделия из любого региона России.', color: 'text-accent' },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border/50 rounded-2xl p-5">
                  <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3 ${item.color}`}>
                    <Icon name={item.icon} fallback="Star" size={20} />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Auth form */}
        <div className="flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold mb-2">Кабинет мастера</h1>
            <p className="text-muted-foreground">Войдите или зарегистрируйтесь</p>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
              <button onClick={() => { setAuthTab('login'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${authTab === 'login' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Войти
              </button>
              <button onClick={() => { setAuthTab('register'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${authTab === 'register' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Новый аккаунт
              </button>
            </div>

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="master@example.ru" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Пароль *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="Минимум 6 символов"
                  onKeyDown={e => e.key === 'Enter' && (authTab === 'login' ? handleLogin() : handleRegister())} />
              </div>
              <button
                onClick={authTab === 'login' ? handleLogin : handleRegister}
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading ? 'Загрузка...' : (authTab === 'login' ? 'Войти' : 'Зарегистрироваться')}
              </button>
            </div>

            {authTab === 'register' && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                После регистрации вам нужно будет подтвердить email
              </p>
            )}
          </div>
        </div>
        </div>
      </div>
    );
  }

  // --- CONFIRM SCREEN ---
  if (screen === 'confirm') {
    return (
      <div className="min-h-screen pt-20 bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Mail" size={28} className="text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Подтвердите email</h1>
            <p className="text-muted-foreground">Письмо отправлено на <strong>{pendingEmail}</strong></p>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            {devToken && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                <p className="font-medium mb-1">Код для подтверждения (dev-режим):</p>
                <code className="text-xs break-all">{devToken}</code>
                <button onClick={() => setConfirmToken(devToken)} className="mt-2 text-xs underline text-amber-600 block">Вставить автоматически</button>
              </div>
            )}
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Код подтверждения</label>
              <input type="text" value={confirmToken} onChange={e => setConfirmToken(e.target.value)} className={inputCls} placeholder="Вставьте код из письма" />
            </div>
            <button onClick={handleConfirm} disabled={loading} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading ? 'Проверяем...' : 'Подтвердить email'}
            </button>
            <button onClick={() => api.auth.resend(pendingEmail)} className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              Отправить повторно
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CABINET SCREEN ---
  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold">Кабинет мастера</h1>
            <p className="text-muted-foreground mt-1">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${status.bg} ${status.color}`}>
              <Icon name={status.icon} fallback="Clock" size={15} />
              {status.label}
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-red-300 hover:text-red-500 transition-colors text-sm">
              <Icon name="LogOut" size={15} />
              Выйти
            </button>
          </div>
        </div>

        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8">
          {([
            { id: 'profile', label: 'Профиль', icon: 'User' },
            { id: 'products', label: 'Товары', icon: 'Package' },
            { id: 'status', label: 'Статус заявки', icon: 'ClipboardCheck' },
          ] as { id: Tab; label: string; icon: string }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon name={t.icon} fallback="Circle" size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-5">Информация о бренде</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Название бренда *</label>
                  <input type="text" value={profile.brand} onChange={e => setProfile({ ...profile, brand: e.target.value })} className={inputCls} placeholder="Например: WoodMaster" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Ваше имя *</label>
                  <input type="text" value={profile.owner_name} onChange={e => setProfile({ ...profile, owner_name: e.target.value })} className={inputCls} placeholder="Иван Иванов" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Регион *</label>
                  <select value={profile.region} onChange={e => setProfile({ ...profile, region: e.target.value })} className={inputCls}>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Категория *</label>
                  <select value={profile.category} onChange={e => setProfile({ ...profile, category: e.target.value })} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Краткое описание *</label>
                <textarea value={profile.description} onChange={e => setProfile({ ...profile, description: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder="Что вы производите?" />
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">История бренда</label>
                <textarea value={profile.story} onChange={e => setProfile({ ...profile, story: e.target.value })} rows={4} className={`${inputCls} resize-none`} placeholder="Расскажите вашу историю..." />
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-5">Контакты</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Телефон</label>
                  <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className={inputCls} placeholder="+7 (999) 000-00-00" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Email для связи</label>
                  <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className={inputCls} placeholder="email@example.ru" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Telegram</label>
                  <input type="text" value={profile.telegram} onChange={e => setProfile({ ...profile, telegram: e.target.value })} className={inputCls} placeholder="@username" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSaveProfile} disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60"
              >
                {profileSaved ? <><Icon name="Check" size={18} />Сохранено!</> : loading ? 'Сохраняем...' : <><Icon name="Save" size={18} />Сохранить и отправить на модерацию</>}
              </button>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="animate-fade-in">
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold">Мои товары</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Icon name="Plus" size={16} />Добавить товар
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
          </div>
        )}

        {tab === 'status' && (
          <div className="animate-fade-in space-y-4">
            <div className={`rounded-2xl border p-6 ${status.bg}`}>
              <div className="flex items-center gap-3 mb-3">
                <Icon name={status.icon} fallback="Clock" size={24} className={status.color} />
                <h2 className={`font-display text-2xl font-bold ${status.color}`}>{status.label}</h2>
              </div>
              {profile.status === 'pending' && <p className="text-muted-foreground">Ваша заявка отправлена и ожидает проверки. Обычно это занимает 1–2 рабочих дня.</p>}
              {profile.status === 'approved' && <p className="text-muted-foreground">Ваш профиль одобрен и виден всем посетителям каталога.</p>}
              {profile.status === 'rejected' && (
                <>
                  <p className="text-muted-foreground mb-2">Ваша заявка отклонена. Проверьте профиль и отправьте повторно.</p>
                  {profile.reject_reason && <p className="text-sm font-medium">Причина: {profile.reject_reason}</p>}
                </>
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