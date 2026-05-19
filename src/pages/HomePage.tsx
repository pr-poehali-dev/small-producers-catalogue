import { useState } from 'react';
import { CATEGORIES, REGIONS, MANUFACTURERS, formatPrice } from '@/data/mockData';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/ui/icon';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<'category' | 'region'>('category');

  const approvedManufacturers = MANUFACTURERS.filter(m => m.status === 'approved');
  const allProducts = approvedManufacturers.flatMap(m =>
    m.products.map(p => ({ product: p, manufacturer: m }))
  );

  const stats = [
    { label: 'Производителей', value: approvedManufacturers.length },
    { label: 'Товаров', value: allProducts.length },
    { label: 'Регионов', value: new Set(approvedManufacturers.map(m => m.region)).size },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-orange-950/30" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Сделано в России
            </div>

            <h1 className="font-display text-6xl md:text-8xl font-bold leading-none mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <span className="gradient-text">СВОЁ</span>
              <br />
              <span className="text-foreground/90 text-4xl md:text-5xl font-medium">производители России</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Собираем малых производителей и мастеров со всей страны в едином пространстве.
              Без маркетплейсов с их грабительскими тарифами, без заблокированных соцсетей —
              <strong className="text-foreground"> напрямую от мастера к покупателю</strong>.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
              >
                Смотреть каталог
              </button>
              <button
                onClick={() => onNavigate('manufacturer-cabinet')}
                className="px-8 py-4 border border-border font-semibold rounded-xl hover:border-primary hover:text-primary transition-all"
              >
                Я производитель →
              </button>
            </div>

            <div className="flex gap-8 mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {stats.map(stat => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-bold text-primary">{stat.value}+</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative cards */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-72 space-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {approvedManufacturers.slice(0, 2).map((m, i) => (
            <div key={m.id} className="bg-card/70 backdrop-blur border border-border/50 rounded-2xl p-4 card-hover cursor-pointer" style={{ animationDelay: `${0.5 + i * 0.1}s` }} onClick={() => onNavigate('manufacturer', { id: m.id })}>
              <div className="flex gap-3">
                <img src={m.photo} alt={m.brand} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{m.brand}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.description.slice(0, 50)}...</p>
                  <p className="text-xs text-primary mt-1 flex items-center gap-1"><Icon name="MapPin" size={10} />{m.region}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why section */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl font-bold text-center mb-4">Почему <span className="gradient-text">Своё</span>?</h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">В эпоху роста тарифов маркетплейсов и блокировок соцсетей мастера теряют доступ к покупателям</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'TrendingDown', title: 'Без комиссий', desc: 'Маркетплейсы берут до 30% с каждой продажи. Здесь производители публикуются бесплатно и общаются с покупателями напрямую.', color: 'text-green-400' },
              { icon: 'Shield', title: 'Проверенные мастера', desc: 'Каждый производитель проходит модерацию администратором. Только настоящие российские мастера и производители.', color: 'text-primary' },
              { icon: 'Map', title: 'Вся страна', desc: 'От Калининграда до Владивостока. Находите уникальные изделия из любого региона России — с контактами и историей бренда.', color: 'text-accent' },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-2xl p-6 card-hover">
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 ${item.color}`}>
                  <Icon name={item.icon} fallback="Star" size={24} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Masters section */}
      <section id="catalog-section" className="py-20 border-t border-border/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Наши мастера</p>
              <h2 className="font-display text-4xl font-bold">Люди за брендами</h2>
            </div>
            <button
              onClick={() => onNavigate('catalog')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 self-start md:self-auto"
            >
              Все производители <Icon name="ArrowRight" size={15} />
            </button>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
            {approvedManufacturers.map((m, i) => {
              const cat = CATEGORIES.find(c => c.id === m.category);
              return (
                <button
                  key={m.id}
                  onClick={() => onNavigate('manufacturer', { id: m.id })}
                  className="flex-shrink-0 w-72 bg-card border border-border/50 rounded-2xl overflow-hidden card-hover text-left group animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s`, scrollSnapAlign: 'start' }}
                >
                  {/* Top image strip */}
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={m.photo}
                      alt={m.brand}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    {/* Category badge */}
                    <span className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-lg">
                      {cat?.emoji} {cat?.label}
                    </span>
                  </div>

                  {/* Avatar overlap */}
                  <div className="relative px-5 pb-5">
                    <div className="flex items-end justify-between -mt-6 mb-3">
                      <div className="w-14 h-14 rounded-2xl border-2 border-card bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-black/30 flex-shrink-0">
                        <span className="font-display font-bold text-white text-xl">
                          {m.brand[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-full mb-1">
                        <Icon name="MapPin" size={11} />
                        {m.region}
                      </div>
                    </div>

                    <p className="font-display font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                      {m.brand}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {m.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Package" size={12} />
                        {m.products.length} {m.products.length === 1 ? 'товар' : 'товара'}
                      </span>
                      <span className="text-primary font-medium group-hover:underline">Смотреть →</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Catalog section */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="font-display text-4xl font-bold mb-2">Каталог товаров</h2>
              <p className="text-muted-foreground">Ручная работа со всей России</p>
            </div>

            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-5 py-3 border border-border rounded-xl hover:border-primary transition-colors font-medium"
              >
                <Icon name="SlidersHorizontal" size={18} />
                Фильтры
                <Icon name={filterOpen ? 'ChevronUp' : 'ChevronDown'} size={16} />
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-xl p-4 z-20 animate-scale-in">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setFilterType('category')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'category' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                    >
                      По категории
                    </button>
                    <button
                      onClick={() => setFilterType('region')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'region' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                    >
                      По региону
                    </button>
                  </div>

                  {filterType === 'category' && (
                    <div className="flex flex-col gap-1">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => { onNavigate('category', { type: cat.id }); setFilterOpen(false); }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm transition-colors text-left"
                        >
                          <span className="text-lg">{cat.emoji}</span>
                          <span>{cat.label}</span>
                          <Icon name="ChevronRight" size={14} className="ml-auto text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}

                  {filterType === 'region' && (
                    <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                      {REGIONS.map(region => (
                        <button
                          key={region}
                          onClick={() => { onNavigate('region', { name: region }); setFilterOpen(false); }}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted text-sm transition-colors text-left"
                        >
                          <Icon name="MapPin" size={13} className="text-muted-foreground flex-shrink-0" />
                          <span>{region}</span>
                          <Icon name="ChevronRight" size={14} className="ml-auto text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Category quick filters */}
          <div className="flex gap-2 flex-wrap mb-8">
            <button
              onClick={() => onNavigate('catalog')}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
            >
              Все
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => onNavigate('category', { type: cat.id })}
                className="px-4 py-2 rounded-full border border-border text-sm font-medium hover:border-primary hover:text-primary transition-colors"
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {allProducts.map(({ product, manufacturer }, i) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <ProductCard
                  product={product}
                  manufacturer={manufacturer}
                  onManufacturerClick={(id) => onNavigate('manufacturer', { id })}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for manufacturers */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="relative bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-primary/20 rounded-3xl p-10 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-xl">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Вы производитель или мастер?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Разместите свои товары бесплатно. Расскажите историю бренда, добавьте контакты и начните получать заявки напрямую.
              </p>
              <button
                onClick={() => onNavigate('manufacturer-cabinet')}
                className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                Зарегистрироваться
                <Icon name="ArrowRight" size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ornament-border-top border-t border-border/50 pt-8 pb-10 mt-2">
        <div className="container mx-auto px-4">
          {/* Ornament row */}
          <div className="flex items-center justify-center gap-3 mb-6 opacity-40 select-none" aria-hidden>
            <span className="text-primary text-lg">✦</span>
            <svg width="120" height="16" viewBox="0 0 120 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 8 Q10 2 20 8 Q30 14 40 8 Q50 2 60 8 Q70 14 80 8 Q90 2 100 8 Q110 14 120 8" stroke="currentColor" strokeWidth="1.5" className="text-primary"/>
              <circle cx="20" cy="8" r="2" fill="currentColor" className="text-primary"/>
              <circle cx="60" cy="8" r="2" fill="currentColor" className="text-primary"/>
              <circle cx="100" cy="8" r="2" fill="currentColor" className="text-primary"/>
            </svg>
            <span className="text-primary text-lg">✦</span>
            <svg width="120" height="16" viewBox="0 0 120 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 8 Q10 2 20 8 Q30 14 40 8 Q50 2 60 8 Q70 14 80 8 Q90 2 100 8 Q110 14 120 8" stroke="currentColor" strokeWidth="1.5" className="text-primary"/>
              <circle cx="20" cy="8" r="2" fill="currentColor" className="text-primary"/>
              <circle cx="60" cy="8" r="2" fill="currentColor" className="text-primary"/>
              <circle cx="100" cy="8" r="2" fill="currentColor" className="text-primary"/>
            </svg>
            <span className="text-primary text-lg">✦</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-display font-bold text-xs">С</span>
              </div>
              <span className="font-display font-bold">Своё</span>
            </div>
            <p className="text-muted-foreground text-sm">Каталог российских производителей · 2024</p>
          </div>
        </div>
      </footer>
    </div>
  );
}