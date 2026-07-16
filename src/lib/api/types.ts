export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

export type CategoryInput = Omit<Category, 'id'>;

export interface Product {
  id: string;
  categoryId: string;
  categorySlug: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string;
  tags: string[];
}

export type ProductInput = Omit<Product, 'id' | 'categorySlug'>;

// The homepage's "Neighborhood Favorites" / "Fresh Out The Oven" / "Sweet Steals"
// rows filter products by exactly these tags — keep the admin tag picker in sync.
export const PRODUCT_TAGS = ['popular', 'new', 'deal', 'deal-box'] as const;

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
}

export interface OrderInput {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  items: OrderItemInput[];
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

export const ORDER_STATUSES = [
  'placed',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];
