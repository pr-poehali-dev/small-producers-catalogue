import { useState } from 'react';
import { Product, Manufacturer, formatPrice, CATEGORIES } from '@/data/mockData';
import Icon from '@/components/ui/icon';

interface ProductCardProps {
  product: Product;
  manufacturer: Manufacturer;
  onManufacturerClick: (id: string) => void;
}

export default function ProductCard({ product, manufacturer, onManufacturerClick }: ProductCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const category = CATEGORIES.find(c => c.id === manufacturer.category);

  if (showDetail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetail(false)}>
        <div className="bg-card rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="relative h-64 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <Icon name="X" size={16} className="text-white" />
            </button>
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-md">
                {category?.emoji} {category?.label}
              </span>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-display text-xl font-semibold mb-1">{product.name}</h3>
            <p className="text-2xl font-display font-bold text-primary mb-4">{formatPrice(product.price)}</p>

            <div className="border border-border rounded-xl p-4 mb-4">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">Производитель</p>
              <p className="font-semibold">{manufacturer.brand}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Icon name="MapPin" size={12} />
                {manufacturer.region}
              </p>
              <div className="flex flex-col gap-1 mt-3 text-sm">
                {manufacturer.contacts.phone && (
                  <a href={`tel:${manufacturer.contacts.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Icon name="Phone" size={14} />
                    {manufacturer.contacts.phone}
                  </a>
                )}
                {manufacturer.contacts.telegram && (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Send" size={14} />
                    {manufacturer.contacts.telegram}
                  </span>
                )}
                {manufacturer.contacts.email && (
                  <a href={`mailto:${manufacturer.contacts.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Icon name="Mail" size={14} />
                    {manufacturer.contacts.email}
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={() => { setShowDetail(false); onManufacturerClick(manufacturer.id); }}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Подробнее о производителе
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card rounded-2xl overflow-hidden card-hover cursor-pointer border border-border/50 group"
      onClick={() => setShowDetail(true)}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="text-xs bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md">
            {category?.emoji} {category?.label}
          </span>
          <span className="font-display font-bold text-white text-lg">{formatPrice(product.price)}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Icon name="Store" size={13} />
          <span>{manufacturer.brand}</span>
          <span className="mx-1">·</span>
          <Icon name="MapPin" size={13} />
          <span>{manufacturer.region}</span>
        </div>
      </div>
    </div>
  );
}
