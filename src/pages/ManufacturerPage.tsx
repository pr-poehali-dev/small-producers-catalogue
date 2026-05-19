import { MANUFACTURERS, CATEGORIES, formatPrice } from '@/data/mockData';
import Icon from '@/components/ui/icon';

interface ManufacturerPageProps {
  manufacturerId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function ManufacturerPage({ manufacturerId, onNavigate }: ManufacturerPageProps) {
  const manufacturer = MANUFACTURERS.find(m => m.id === manufacturerId);

  if (!manufacturer) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">😕</p>
          <p className="font-display text-2xl">Производитель не найден</p>
          <button onClick={() => onNavigate('home')} className="mt-4 text-primary hover:underline">На главную</button>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.id === manufacturer.category);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={manufacturer.photo} alt={manufacturer.brand} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-3">
            <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Главная</button>
            <Icon name="ChevronRight" size={14} />
            <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">Каталог</button>
            <Icon name="ChevronRight" size={14} />
            <span className="text-white">{manufacturer.brand}</span>
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-md">
                  {category?.emoji} {category?.label}
                </span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-md border border-green-500/30">
                  ✓ Проверен
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white">{manufacturer.brand}</h1>
              <p className="text-white/70 mt-1 flex items-center gap-1">
                <Icon name="MapPin" size={14} />
                {manufacturer.region}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="font-display text-2xl font-semibold mb-4">История бренда</h2>
              <p className="text-muted-foreground leading-relaxed">{manufacturer.story}</p>
            </div>

            {/* Products */}
            <div>
              <h2 className="font-display text-2xl font-semibold mb-5">Товары</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {manufacturer.products.map((product, i) => (
                  <div
                    key={product.id}
                    className="bg-card border border-border/50 rounded-2xl overflow-hidden card-hover animate-fade-in group"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 right-3">
                        <span className="font-display font-bold text-white text-xl">{formatPrice(product.price)}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-semibold group-hover:text-primary transition-colors">{product.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6 sticky top-24">
              <h3 className="font-display text-lg font-semibold mb-4">Контакты</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="User" size={15} className="text-primary" />
                  <span className="font-medium text-foreground">{manufacturer.name}</span>
                </div>
                {manufacturer.contacts.phone && (
                  <a
                    href={`tel:${manufacturer.contacts.phone}`}
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Icon name="Phone" size={15} className="text-primary" />
                    <span>{manufacturer.contacts.phone}</span>
                  </a>
                )}
                {manufacturer.contacts.email && (
                  <a
                    href={`mailto:${manufacturer.contacts.email}`}
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Icon name="Mail" size={15} className="text-primary" />
                    <span>{manufacturer.contacts.email}</span>
                  </a>
                )}
                {manufacturer.contacts.telegram && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Send" size={15} className="text-primary" />
                    <span>{manufacturer.contacts.telegram}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Icon name="Package" size={14} />
                  <span>{manufacturer.products.length} товаров</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="MapPin" size={14} />
                  <span>{manufacturer.region}</span>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                Написать производителю
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
