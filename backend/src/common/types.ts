export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  description: string;
  coverImage: string;
  category: string;
  categoryId?: string;
  publisher: string;
  publishYear: number;
  pages: number;
  language: string;
  isbn: string;
  stock: number;
  soldCount?: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  bookCount: number;
}

export type PublicUser = {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  phone: string;
  address: string;
  role: 'customer' | 'admin' | 'staff';
  avatar?: string;
  isActive?: boolean;
  createdAt: string;
};

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  bookId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  phone: string;
  paymentMethod: 'cash' | 'transfer';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
