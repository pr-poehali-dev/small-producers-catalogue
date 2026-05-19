export const CATEGORIES = [
  { id: 'jewelry', label: 'Украшения', emoji: '💍' },
  { id: 'home', label: 'Товары для дома', emoji: '🏡' },
  { id: 'furniture', label: 'Мебель', emoji: '🪑' },
  { id: 'clothing', label: 'Одежда', emoji: '👗' },
  { id: 'other', label: 'Другое', emoji: '✨' },
];

export const REGIONS = [
  'Москва', 'Санкт-Петербург', 'Краснодарский край', 'Татарстан',
  'Свердловская область', 'Новосибирская область', 'Башкортостан',
  'Ростовская область', 'Нижегородская область', 'Самарская область',
  'Красноярский край', 'Алтайский край', 'Воронежская область',
  'Тульская область', 'Удмуртская Республика',
];

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  manufacturerId: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  brand: string;
  region: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  story: string;
  photo: string;
  contacts: {
    phone?: string;
    email?: string;
    website?: string;
    telegram?: string;
  };
  products: Product[];
}

export const MANUFACTURERS: Manufacturer[] = [
  {
    id: '1',
    name: 'Анна Петрова',
    brand: 'AnnCraft',
    region: 'Москва',
    category: 'jewelry',
    status: 'approved',
    description: 'Авторские украшения ручной работы из серебра и натуральных камней',
    story: 'Мы создаём украшения уже более 8 лет. Каждое изделие — это маленькое произведение искусства, сделанное с душой и любовью к своему делу. Вдохновение черпаем в природе и народных мотивах.',
    photo: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/7ba51d9e-7190-48f2-99f8-5ee3900e2f2f.jpg',
    contacts: { phone: '+7 (905) 123-45-67', email: 'anna@anncraft.ru', telegram: '@anncraft' },
    products: [
      { id: 'p1', name: 'Кольцо "Лесная фея"', price: 3200, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/7ba51d9e-7190-48f2-99f8-5ee3900e2f2f.jpg', manufacturerId: '1' },
      { id: 'p2', name: 'Серьги "Северное сияние"', price: 2800, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/7ba51d9e-7190-48f2-99f8-5ee3900e2f2f.jpg', manufacturerId: '1' },
      { id: 'p3', name: 'Браслет "Ручей"', price: 1900, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/7ba51d9e-7190-48f2-99f8-5ee3900e2f2f.jpg', manufacturerId: '1' },
    ],
  },
  {
    id: '2',
    name: 'Сергей Волков',
    brand: 'WoodMaster',
    region: 'Краснодарский край',
    category: 'furniture',
    status: 'approved',
    description: 'Мебель из массива дерева под заказ — от стола до целого гарнитура',
    story: 'Семейная мастерская WoodMaster работает с 2015 года. Мы используем только экологически чистые породы дерева из Краснодарского края. Каждый предмет мебели создаётся индивидуально под запросы клиента.',
    photo: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/c43dd3cd-8fa4-41b2-9bd6-bfddc81ce772.jpg',
    contacts: { phone: '+7 (918) 234-56-78', email: 'woodmaster@yandex.ru' },
    products: [
      { id: 'p4', name: 'Обеденный стол "Дуб"', price: 45000, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/c43dd3cd-8fa4-41b2-9bd6-bfddc81ce772.jpg', manufacturerId: '2' },
      { id: 'p5', name: 'Полка-лестница', price: 8500, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/c43dd3cd-8fa4-41b2-9bd6-bfddc81ce772.jpg', manufacturerId: '2' },
      { id: 'p6', name: 'Кресло-качалка', price: 22000, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/c43dd3cd-8fa4-41b2-9bd6-bfddc81ce772.jpg', manufacturerId: '2' },
    ],
  },
  {
    id: '3',
    name: 'Марина Козлова',
    brand: 'LinenHouse',
    region: 'Татарстан',
    category: 'clothing',
    status: 'approved',
    description: 'Натуральная льняная одежда с авторской вышивкой',
    story: 'LinenHouse — это история о возвращении к истокам. Мы создаём одежду из чистого льна с ручной вышивкой традиционных татарских орнаментов, адаптированных для современного горожанина.',
    photo: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/e0d46f9f-5d99-49db-ab65-bb7eb8f564a2.jpg',
    contacts: { phone: '+7 (843) 345-67-89', telegram: '@linenhouse_kzn', email: 'linen@house.ru' },
    products: [
      { id: 'p7', name: 'Платье "Казанское"', price: 7800, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/e0d46f9f-5d99-49db-ab65-bb7eb8f564a2.jpg', manufacturerId: '3' },
      { id: 'p8', name: 'Рубашка льняная', price: 4200, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/e0d46f9f-5d99-49db-ab65-bb7eb8f564a2.jpg', manufacturerId: '3' },
      { id: 'p9', name: 'Сарафан с вышивкой', price: 6500, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/e0d46f9f-5d99-49db-ab65-bb7eb8f564a2.jpg', manufacturerId: '3' },
    ],
  },
  {
    id: '4',
    name: 'Дмитрий Орлов',
    brand: 'GlinaDom',
    region: 'Тульская область',
    category: 'home',
    status: 'approved',
    description: 'Керамика ручной работы: посуда, вазы и декор для дома',
    story: 'Гончарная мастерская GlinaDom существует с 2018 года. Мы делаем керамику по старинным тульским рецептам, добавляя современный дизайн и натуральные глазури. Каждое изделие уникально.',
    photo: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/92ece0ff-7220-4165-b8f7-7acc0d2b2605.jpg',
    contacts: { phone: '+7 (487) 456-78-90', email: 'glinadom@mail.ru' },
    products: [
      { id: 'p10', name: 'Набор кружек "Лето"', price: 3600, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/92ece0ff-7220-4165-b8f7-7acc0d2b2605.jpg', manufacturerId: '4' },
      { id: 'p11', name: 'Ваза "Поле"', price: 2900, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/92ece0ff-7220-4165-b8f7-7acc0d2b2605.jpg', manufacturerId: '4' },
      { id: 'p12', name: 'Тарелка декоративная', price: 1800, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/92ece0ff-7220-4165-b8f7-7acc0d2b2605.jpg', manufacturerId: '4' },
    ],
  },
  {
    id: '5',
    name: 'Ольга Смирнова',
    brand: 'PerfumeLab',
    region: 'Санкт-Петербург',
    category: 'other',
    status: 'pending',
    description: 'Натуральная парфюмерия и свечи ручной работы',
    story: 'Создаём ароматы вдохновлённые природой Ленинградской области. Никакой химии — только натуральные эфирные масла и воск.',
    photo: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/92ece0ff-7220-4165-b8f7-7acc0d2b2605.jpg',
    contacts: { email: 'perfumelab.spb@gmail.com', telegram: '@perfumelab_spb' },
    products: [
      { id: 'p13', name: 'Свеча "Белая ночь"', price: 1200, image: 'https://cdn.poehali.dev/projects/8cf87977-716b-4e65-b6a1-39a0723b67a3/files/92ece0ff-7220-4165-b8f7-7acc0d2b2605.jpg', manufacturerId: '5' },
    ],
  },
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price);
