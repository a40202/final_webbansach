import type { Book, Category, Order, Review, User } from '@/lib/data'

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://localhost:3001/api'

export type PublicUser = Omit<User, 'password'>

export interface AuthResponse {
  user: PublicUser
  accessToken: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const TOKEN_KEY = 'accessToken'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(
  path: string,
  options?: RequestInit & { auth?: boolean },
): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  const useAuth = options?.auth !== false
  const token = getAccessToken()
  if (useAuth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  const { auth: _auth, ...fetchOptions } = options ?? {}

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const err = (await res.json()) as { message?: string | string[] }
      if (typeof err.message === 'string') message = err.message
      else if (Array.isArray(err.message)) message = err.message.join(', ')
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ——— Books (public) ———

export interface Promotion {
  id: string
  title: string
  description: string
  code?: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  minOrder?: number
  startDate: string
  endDate: string
  isActive: boolean
  imageUrl?: string
  createdAt: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  authorName: string
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface OrderWithCustomer extends Order {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

export interface DashboardStats {
  totalBooks: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  pendingOrders: number
  lowStockBooks: number
  recentOrders: OrderWithCustomer[]
}

export interface ReportsStats {
  totalRevenue: number
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
  avgOrderValue: number
  revenueChange: number
  ordersChange: number
  topBooks: { bookId: string; title: string; quantity: number; revenue: number }[]
  ordersByStatus: Record<string, number>
  revenueByMonth: { month: string; revenue: number; orders: number }[]
}

export interface BooksQuery {
  search?: string
  category?: string
  author?: string
  publisher?: string
  filter?: 'featured' | 'new' | 'bestseller'
  sortBy?: string
  minPrice?: number
  maxPrice?: number
}

function toQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const booksApi = {
  getAll: (query?: BooksQuery) =>
    request<Book[]>(`/books${toQuery(query ?? {})}`, { auth: false }),
  getById: (id: string) =>
    request<Book>(`/books/${id}`, { auth: false }),
  getFeatured: () =>
    request<Book[]>('/books/featured', { auth: false }),
  getNewArrivals: () =>
    request<Book[]>('/books/new-arrivals', { auth: false }),
  getBestSellers: () =>
    request<Book[]>('/books/best-sellers', { auth: false }),
  getFiltersMeta: () =>
    request<{ authors: string[]; publishers: string[] }>(
      '/books/filters/meta',
      { auth: false },
    ),
}

// ——— Categories (public) ———

export interface Invoice {
  id: string
  orderId: string
  userId: string
  subtotal: number
  shippingFee: number
  discount: number
  totalAmount: number
  paymentMethod: 'cash' | 'transfer'
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  buyerAddress: string
  note?: string
  issuedAt: string
  paidAt?: string
  items: {
    bookId: string
    bookTitle: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }[]
  orderStatus?: string
}

export const categoriesApi = {
  getAll: () => request<Category[]>('/categories', { auth: false }),
  getById: (id: string) =>
    request<Category>(`/categories/${id}`, { auth: false }),
  create: (data: { name: string; slug?: string; description: string }) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: Partial<{ name: string; slug: string; description: string }>,
  ) =>
    request<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
}

export const invoicesApi = {
  getAll: () => request<Invoice[]>('/invoices'),
  getByOrder: (orderId: string) =>
    request<Invoice>(`/invoices/order/${orderId}`),
  getById: (id: string) => request<Invoice>(`/invoices/${id}`),
  updatePayment: (id: string, status: Invoice['paymentStatus']) =>
    request<Invoice>(`/invoices/${id}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// ——— Auth ———

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    }),
  register: (data: {
    email: string
    password: string
    fullName: string
    phone: string
    address: string
  }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),
  me: () => request<PublicUser>('/auth/me'),
  updateProfile: (data: Partial<PublicUser>) =>
    request<PublicUser>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}

// ——— Stats (admin/staff) ———

export const statsApi = {
  getDashboard: () => request<DashboardStats>('/stats/dashboard'),
  getReports: (range = '30days') =>
    request<ReportsStats>(`/stats/reports?range=${range}`),
}

// ——— Promotions ———

export const promotionsApi = {
  getActive: () => request<Promotion[]>('/promotions/active', { auth: false }),
  getAll: () => request<Promotion[]>('/promotions'),
  create: (data: Omit<Promotion, 'id' | 'createdAt'>) =>
    request<Promotion>('/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Omit<Promotion, 'id' | 'createdAt'>>) =>
    request<Promotion>(`/promotions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<void>(`/promotions/${id}`, { method: 'DELETE' }),
}

// ——— Articles ———

export const articlesApi = {
  getPublished: () =>
    request<Article[]>('/articles/published', { auth: false }),
  getBySlug: (slug: string) =>
    request<Article>(`/articles/slug/${slug}`, { auth: false }),
  getAll: () => request<Article[]>('/articles'),
  create: (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Article>('/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>,
  ) =>
    request<Article>(`/articles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<void>(`/articles/${id}`, { method: 'DELETE' }),
}

// ——— Cart (JWT required) ———

export interface CartItemResponse {
  bookId: string
  quantity: number
  book: Book
}

export interface CartResponse {
  id: string
  userId: string
  items: CartItemResponse[]
  itemCount: number
  totalAmount: number
}

export const cartApi = {
  get: () => request<CartResponse>('/cart'),
  addItem: (bookId: string, quantity = 1) =>
    request<CartResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ bookId, quantity }),
    }),
  updateItem: (bookId: string, quantity: number) =>
    request<CartResponse>(`/cart/items/${bookId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
  removeItem: (bookId: string) =>
    request<CartResponse>(`/cart/items/${bookId}`, { method: 'DELETE' }),
  clear: () => request<CartResponse>('/cart', { method: 'DELETE' }),
  merge: (items: { bookId: string; quantity: number }[]) =>
    request<CartResponse>('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),
}

export type ReturnStatusType =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'received'
  | 'refunded'
  | 'cancelled'

export type ReturnReasonType =
  | 'defective'
  | 'wrong_item'
  | 'not_as_described'
  | 'changed_mind'
  | 'other'

export interface ReturnRequest {
  id: string
  orderId: string
  userId: string
  status: ReturnStatusType
  reason: ReturnReasonType
  description: string
  adminNote?: string
  refundAmount?: number
  createdAt: string
  updatedAt: string
  items: { bookId: string; quantity: number; price: number; bookTitle?: string }[]
  customerName?: string
  customerEmail?: string
}

export const returnsApi = {
  getAll: () => request<ReturnRequest[]>('/returns'),
  getById: (id: string) => request<ReturnRequest>(`/returns/${id}`),
  create: (data: {
    orderId: string
    reason: ReturnReasonType
    description: string
    items: { bookId: string; quantity: number }[]
  }) =>
    request<ReturnRequest>('/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStatus: (
    id: string,
    status: ReturnStatusType,
    adminNote?: string,
    refundAmount?: number,
  ) =>
    request<ReturnRequest>(`/returns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNote, refundAmount }),
    }),
}

// ——— Orders (JWT required) ———

export const ordersApi = {
  getAll: (userId?: string) =>
    request<OrderWithCustomer[]>(
      `/orders${userId ? `?userId=${userId}` : ''}`,
    ),
  getById: (id: string) => request<Order>(`/orders/${id}`),
  create: (data: {
    items: { bookId: string; quantity: number }[]
    shippingAddress: string
    phone: string
    paymentMethod: 'cash' | 'transfer'
    shippingFee?: number
    buyerName?: string
    buyerEmail?: string
    note?: string
  }) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancel: (id: string) =>
    request<Order>(`/orders/${id}/cancel`, { method: 'PATCH' }),
  updateStatus: (id: string, status: Order['status']) =>
    request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// ——— Reviews (public) ———

export const reviewsApi = {
  getByBook: (bookId: string) =>
    request<Review[]>(`/reviews?bookId=${bookId}`, { auth: false }),
}

// ——— Users (admin + JWT) ———

export const usersApi = {
  getAll: () => request<PublicUser[]>('/users'),
}
