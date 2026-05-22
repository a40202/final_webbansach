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

export interface BooksQuery {
  search?: string
  category?: string
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
}

// ——— Categories (public) ———

export const categoriesApi = {
  getAll: () => request<Category[]>('/categories', { auth: false }),
  getById: (id: string) =>
    request<Category>(`/categories/${id}`, { auth: false }),
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

// ——— Orders (JWT required) ———

export const ordersApi = {
  getAll: (userId?: string) =>
    request<Order[]>(`/orders${userId ? `?userId=${userId}` : ''}`),
  getById: (id: string) => request<Order>(`/orders/${id}`),
  create: (data: {
    items: { bookId: string; quantity: number }[]
    shippingAddress: string
    phone: string
    paymentMethod: 'cash' | 'transfer'
    shippingFee?: number
  }) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
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
