import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { MANUFACTURERS, CATEGORIES } from '@/data/mockData';

interface VisitorCabinetProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type Tab = 'favorites' | 'chats';
type Screen = 'auth' | 'confirm' | 'cabinet';
type AuthTab = 'login' | 'register';

interface FavItem { id: number; type: string; ref_id: string; created_at: string; }
interface Chat { chat_id: number; manufacturer_id: number; brand: string; photo_url: string; last_msg: string | null; last_at: string | null; }
interface Message { id: number; sender_id: number; body: string; created_at: string; }

export default function VisitorCabinet({ onNavigate }: VisitorCabinetProps) {
  const [screen, setScreen] = useState<Screen>('auth');
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [tab, setTab] = useState<Tab>('favorites');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmToken, setConfirmToken] = useState('');
  const [devToken, setDevToken] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [user, setUser] = useState<{ user_id: number; email: string } | null>(null);
  const [favorites, setFavorites] = useState<FavItem[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('svoe_visitor_token');
    if (token) {
      api.auth.meVisitor().then(res => {
        if (res.user_id && res.role === 'visitor') {
          setUser(res);
          setScreen('cabinet');
          loadData();
        } else {
          localStorage.removeItem('svoe_visitor_token');
        }
      }).catch(() => localStorage.removeItem('svoe_visitor_token'));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    const [favRes, chatRes] = await Promise.all([api.visitors.favorites(), api.visitors.chats()]);
    if (Array.isArray(favRes)) setFavorites(favRes);
    if (Array.isArray(chatRes)) setChats(chatRes);
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.register(email, password, 'visitor');
      if (res.error) { setError(res.error); return; }
      setPendingEmail(email);
      setDevToken(res.confirmation_token || '');
      setScreen('confirm');
    } finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.confirmEmail(confirmToken);
      if (res.error) { setError(res.error); return; }
      setSuccess('Email подтверждён! Войдите.');
      setAuthTab('login');
      setEmail(pendingEmail);
      setScreen('auth');
    } finally { setLoading(false); }
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.error) { setError(res.error); return; }
      localStorage.setItem('svoe_visitor_token', res.token);
      setUser({ user_id: res.user_id, email: res.email });
      setScreen('cabinet');
      loadData();
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await api.auth.logoutVisitor();
    localStorage.removeItem('svoe_visitor_token');
    setUser(null);
    setScreen('auth');
  };

  const openChat = async (chat: Chat) => {
    setActiveChat(chat);
    const msgs = await api.visitors.chatMessages(chat.chat_id);
    if (Array.isArray(msgs)) setMessages(msgs);
  };

  const sendMessage = async () => {
    if (!activeChat || !msgInput.trim()) return;
    const res = await api.visitors.sendMessage(activeChat.manufacturer_id, msgInput);
    if (res.chat_id) {
      setMsgInput('');
      const msgs = await api.visitors.chatMessages(activeChat.chat_id);
      if (Array.isArray(msgs)) setMessages(msgs);
      loadData();
    }
  };

  const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors";

  // --- AUTH SCREEN ---
  if (screen === 'auth') {
    return (
      <div className="min-h-screen pt-20 bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold mb-2">Кабинет ценителя</h1>
            <p className="text-muted-foreground">Сохраняйте любимых мастеров и пишите им напрямую</p>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
              {(['login', 'register'] as AuthTab[]).map(t => (
                <button key={t} onClick={() => { setAuthTab(t); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${authTab === t ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t === 'login' ? 'Войти' : 'Зарегистрироваться'}
                </button>
              ))}
            </div>
            {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="you@example.ru" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Пароль *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="Минимум 6 символов"
                  onKeyDown={e => e.key === 'Enter' && (authTab === 'login' ? handleLogin() : handleRegister())} />
              </div>
              <button onClick={authTab === 'login' ? handleLogin : handleRegister} disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading ? 'Загрузка...' : (authTab === 'login' ? 'Войти' : 'Создать аккаунт')}
              </button>
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
                <p className="font-medium mb-1">Код подтверждения (dev-режим):</p>
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
          </div>
        </div>
      </div>
    );
  }

  // --- CABINET ---
  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold">Кабинет ценителя</h1>
            <p className="text-muted-foreground mt-1">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-red-300 hover:text-red-500 transition-colors text-sm">
            <Icon name="LogOut" size={15} />Выйти
          </button>
        </div>

        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8">
          {([
            { id: 'favorites', label: 'Избранное', icon: 'Heart' },
            { id: 'chats', label: 'Сообщения', icon: 'MessageCircle' },
          ] as { id: Tab; label: string; icon: string }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon name={t.icon} fallback="Circle" size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'favorites' && (
          <div className="animate-fade-in">
            {favorites.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Icon name="Heart" size={28} className="text-muted-foreground/50" />
                </div>
                <p className="font-semibold mb-1">Пока нет избранного</p>
                <p className="text-sm mb-6">Добавляйте мастеров и товары в избранное — они появятся здесь</p>
                <button onClick={() => onNavigate('catalog')} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                  Перейти в каталог
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.map(fav => {
                  const mfr = MANUFACTURERS.find(m => m.id === fav.ref_id);
                  if (fav.type === 'manufacturer' && mfr) {
                    const cat = CATEGORIES.find(c => c.id === mfr.category);
                    return (
                      <button key={fav.id} onClick={() => onNavigate('manufacturer', { id: mfr.id })}
                        className="bg-card border border-border/50 rounded-2xl p-4 text-left card-hover flex gap-4"
                      >
                        <img src={mfr.photo} alt={mfr.brand} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        <div>
                          <p className="font-semibold">{mfr.brand}</p>
                          <p className="text-xs text-muted-foreground">{cat?.emoji} {cat?.label} · {mfr.region}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{mfr.description}</p>
                        </div>
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'chats' && (
          <div className="animate-fade-in">
            {!activeChat ? (
              chats.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Icon name="MessageCircle" size={28} className="text-muted-foreground/50" />
                  </div>
                  <p className="font-semibold mb-1">Нет сообщений</p>
                  <p className="text-sm">Напишите производителю со страницы его профиля</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chats.map(chat => (
                    <button key={chat.chat_id} onClick={() => openChat(chat)}
                      className="w-full bg-card border border-border/50 rounded-2xl p-4 text-left card-hover flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <span className="font-display font-bold text-white">{chat.brand[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{chat.brand}</p>
                        <p className="text-sm text-muted-foreground truncate">{chat.last_msg || 'Нет сообщений'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <button onClick={() => setActiveChat(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name="ArrowLeft" size={20} />
                  </button>
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="font-display font-bold text-white text-sm">{activeChat.brand[0]}</span>
                  </div>
                  <p className="font-semibold">{activeChat.brand}</p>
                </div>

                <div className="h-96 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">Нет сообщений. Напишите первым!</p>
                  )}
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.user_id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${msg.sender_id === user?.user_id ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                        {msg.body}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-border flex gap-3">
                  <input
                    type="text"
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors text-sm"
                    placeholder="Напишите сообщение..."
                  />
                  <button onClick={sendMessage} className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
                    <Icon name="Send" size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}