import { useState, useMemo } from 'react';
import { MANUFACTURERS, CATEGORIES, REGIONS, formatPrice } from '@/data/mockData';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/ui/icon';

interface CatalogPageProps {
  filterCategory?: string;
  filterRegion?: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function CatalogPage({ filterCategory, filterRegion, onNavigate }: CatalogPageProps) {
  const [activeCategory, setActiveCategory] = useState(filterCategory || 'all');
  const [activeRegion, setActiveRegion] = useState(filterRegion || 'all');
  const [search, setSearch] = useState('');
  const [regionOpen, setRegionOpen] = useState(false);

  const approvedManufacturers = MANUFACTURERS.filter(m => m.status === 'approved');

  const allProducts = useMemo(() => {
    return approvedManufacturers.flatMap(m =>
      m.products.map(p => ({ product: p, manufacturer: m }))
    ).filter(({ product, manufacturer }) => {
      const catMatch = activeCategory === 'all' || manufacturer.category === activeCategory;
      const regMatch = activeRegion === 'all' || manufacturer.region === activeRegion;
      const searchMatch = !search || product.name.toLowerCase().includes(search.toLowerCase()) || manufacturer.brand.toLowerCase().includes(search.toLowerCase());
      return catMatch && regMatch && searchMatch;
    });
  }, [activeCategory, activeRegion, search, approvedManufacturers]);

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
            <button onClick={() => onNavigate('home')} className="hover:text-foreground transition-colors">Главная</button>
            <Icon name="ChevronRight" size={14} />
            <span className="text-foreground">Каталог</span>
            {currentCategory && (
              <>
                <Icon name="ChevronRight" size={14} />
                <span className="text-primary">{currentCategory.emoji} {currentCategory.label}</span>
              </>
            )}
          </div>
          <h1 className="font-display text-5xl font-bold mb-2">
            {currentCategory ? `${currentCategory.emoji} ${currentCategory.label}` : 'Все товары'}
          </h1>
          <p className="text-muted-foreground">{allProducts.length} товаров от российских мастеров</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-60 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Категории</p>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${activeCategory === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  >
                    <span>🎯</span> Все категории
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${activeCategory === cat.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      <span>{cat.emoji}</span> {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regions */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Регион</p>
                <div className="relative">
                  <button
                    onClick={() => setRegionOpen(!regionOpen)}
                    className="w-full flex items-center justify-between px-3 py-2.5 border border-border rounded-xl text-sm hover:border-primary transition-colors"
                  >
                    <span>{activeRegion === 'all' ? 'Все регионы' : activeRegion}</span>
                    <Icon name={regionOpen ? 'ChevronUp' : 'ChevronDown'} size={14} />
                  </button>
                  {regionOpen && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-xl z-10 max-h-56 overflow-y-auto animate-scale-in">
                      <button
                        onClick={() => { setActiveRegion('all'); setRegionOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                      >
                        Все регионы
                      </button>
                      {REGIONS.map(region => (
                        <button
                          key={region}
                          onClick={() => { setActiveRegion(region); setRegionOpen(false); }}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors ${activeRegion === region ? 'text-primary font-medium' : ''}`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {allProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="font-display text-2xl font-semibold mb-2">Ничего не найдено</p>
                <p className="text-muted-foreground">Попробуйте изменить фильтры</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {allProducts.map(({ product, manufacturer }, i) => (
                  <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                    <ProductCard
                      product={product}
                      manufacturer={manufacturer}
                      onManufacturerClick={(id) => onNavigate('manufacturer', { id })}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
