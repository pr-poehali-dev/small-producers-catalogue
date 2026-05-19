import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="ornament-border-bottom fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-display font-bold text-sm">С</span>
            </div>
            <span className="font-display text-xl font-bold tracking-wide">Своё</span>
          </button>

          <p className="hidden md:block text-sm text-muted-foreground border-l border-border pl-4">
            производители России
          </p>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onNavigate('catalog')}
            className={`text-sm font-medium transition-colors hover:text-primary ${currentPage === 'catalog' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Каталог
          </button>
          <button
            onClick={() => onNavigate('manufacturer-cabinet')}
            className={`text-sm font-medium transition-colors hover:text-primary ${currentPage === 'manufacturer-cabinet' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Для мастеров
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onNavigate('visitor-cabinet')}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Кабинет ценителя
          </button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Icon name={mobileOpen ? 'X' : 'Menu'} size={20} />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-fade-in">
          <div className="container px-4 py-4 flex flex-col gap-3">
            <button onClick={() => { onNavigate('catalog'); setMobileOpen(false); }} className="text-left py-2 font-medium hover:text-primary transition-colors">Каталог</button>
            <button onClick={() => { onNavigate('manufacturer-cabinet'); setMobileOpen(false); }} className="text-left py-2 font-medium hover:text-primary transition-colors">Для мастеров</button>
            <button onClick={() => { onNavigate('visitor-cabinet'); setMobileOpen(false); }} className="text-left py-2 text-primary font-medium">Кабинет ценителя</button>
          </div>
        </div>
      )}
    </nav>
  );
}
