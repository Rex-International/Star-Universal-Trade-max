export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  phone?: string;
  country?: string;
  avatar_url?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  quantity: number;
  category_id?: string;
  seller_id?: string;
  is_active: boolean;
  is_featured: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  category?: Category;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  display_order: number;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  product?: Product;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  payment_status: string;
  shipping_address: Record<string, unknown>;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  product_name: string;
  variant_name?: string;
  sku?: string;
  price: number;
  quantity: number;
  total: number;
  image_url?: string;
};

export type Review = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  profiles?: { full_name: string };
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type Address = {
  id: string;
  user_id: string;
  label?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country_code: string;
  is_default: boolean;
};
