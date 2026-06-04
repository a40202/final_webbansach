'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import { booksApi, cartApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { CartItem, Book, getBookById } from '@/lib/data'

const GUEST_CART_KEY = 'cart_guest'
const LEGACY_CART_KEY = 'cart'

interface CartContextType {
  items: CartItem[]
  isSyncing: boolean
  addToCart: (bookId: string, quantity?: number, book?: Book) => void
  removeFromCart: (bookId: string) => void
  updateQuantity: (bookId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  getCartItems: () => { book: Book; quantity: number }[]
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function readGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  const guest = localStorage.getItem(GUEST_CART_KEY)
  if (guest) return JSON.parse(guest) as CartItem[]
  const legacy = localStorage.getItem(LEGACY_CART_KEY)
  if (legacy) {
    localStorage.setItem(GUEST_CART_KEY, legacy)
    localStorage.removeItem(LEGACY_CART_KEY)
    return JSON.parse(legacy) as CartItem[]
  }
  return []
}

function writeGuestCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

async function fetchBooksForCart(items: CartItem[]): Promise<Book[]> {
  const results = await Promise.all(
    items.map((item) =>
      booksApi.getById(item.bookId).catch(() => undefined),
    ),
  )
  return results.filter((b): b is Book => b !== undefined)
}

function cartResponseToItems(
  items: { bookId: string; quantity: number; book: Book }[],
): CartItem[] {
  return items.map((i) => ({ bookId: i.bookId, quantity: i.quantity }))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [booksById, setBooksById] = useState<Record<string, Book>>({})
  const [isSyncing, setIsSyncing] = useState(false)
  /** `undefined` = chưa sync lần đầu; `null` = khách vãng lai */
  const prevUserId = useRef<string | null | undefined>(undefined)
  const guestCartHydrated = useRef(false)

  const mergeBookCache = useCallback((books: Book[]) => {
    setBooksById((prev) => ({
      ...prev,
      ...Object.fromEntries(books.map((b) => [b.id, b])),
    }))
  }, [])

  const applyServerCart = useCallback(
    (response: { items: { bookId: string; quantity: number; book: Book }[] }) => {
      mergeBookCache(response.items.map((i) => i.book))
      setItems(cartResponseToItems(response.items))
    },
    [mergeBookCache],
  )

  useEffect(() => {
    if (authLoading) return

    const userId = user?.id ?? null
    if (prevUserId.current !== undefined && userId === prevUserId.current) {
      return
    }
    prevUserId.current = userId

    async function syncForUser() {
      setIsSyncing(true)
      try {
        if (userId) {
          guestCartHydrated.current = false
          const guestItems = readGuestCart()
          if (guestItems.length > 0) {
            const merged = await cartApi.merge(guestItems)
            writeGuestCart([])
            applyServerCart(merged)
          } else {
            const cart = await cartApi.get()
            applyServerCart(cart)
          }
        } else {
          const guestItems = readGuestCart()
          setItems(guestItems)
          if (guestItems.length > 0) {
            const books = await fetchBooksForCart(guestItems)
            mergeBookCache(books)
          }
          guestCartHydrated.current = true
        }
      } catch (err) {
        // Đừng nuốt lỗi hoàn toàn: nếu API lỗi/sai response shape
        // sẽ khiến cartItems luôn rỗng.
        // eslint-disable-next-line no-console
        console.error('[CartProvider] syncForUser failed', err)

        if (userId) {
          try {
            const cart = await cartApi.get()
            applyServerCart(cart)
          } catch {
            setItems([])
          }
        } else {
          const guestItems = readGuestCart()
          setItems(guestItems)
          if (guestItems.length > 0) {
            const books = await fetchBooksForCart(guestItems)
            mergeBookCache(books)
          }
          guestCartHydrated.current = true
        }
      } finally {
        setIsSyncing(false)
      }
    }

    syncForUser()
  }, [user?.id, authLoading, applyServerCart, mergeBookCache])

  useEffect(() => {
    if (!user && !authLoading && guestCartHydrated.current) {
      writeGuestCart(items)
    }
  }, [items, user, authLoading])


  const resolveBook = (bookId: string): Book | undefined =>
    booksById[bookId] ?? getBookById(bookId)

  const addToCart = (bookId: string, quantity: number = 1, book?: Book) => {
    if (user) {
      cartApi
        .addItem(bookId, quantity)
        .then(applyServerCart)
        .catch(() => {})
      return
    }
    if (book) {
      mergeBookCache([book])
    } else {
      booksApi
        .getById(bookId)
        .then((b) => mergeBookCache([b]))
        .catch(() => {})
    }
    guestCartHydrated.current = true
    setItems((prev) => {
      const existing = prev.find((i) => i.bookId === bookId)
      if (existing) {
        return prev.map((i) =>
          i.bookId === bookId
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        )
      }
      return [...prev, { bookId, quantity }]
    })
  }

  const removeFromCart = (bookId: string) => {
    if (user) {
      cartApi.removeItem(bookId).then(applyServerCart).catch(() => {})
      return
    }
    setItems((prev) => prev.filter((i) => i.bookId !== bookId))
  }

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId)
      return
    }
    if (user) {
      cartApi.updateItem(bookId, quantity).then(applyServerCart).catch(() => {})
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.bookId === bookId ? { ...i, quantity } : i)),
    )
  }

  const clearCart = () => {
    if (user) {
      cartApi.clear().then(applyServerCart).catch(() => {})
      return
    }
    setItems([])
    writeGuestCart([])
  }

  const getCartTotal = () =>
    items.reduce((total, item) => {
      const book = resolveBook(item.bookId)
      return total + (book?.price || 0) * item.quantity
    }, 0)

  const getCartCount = () =>
    items.reduce((count, item) => count + item.quantity, 0)

  const getCartItems = () =>
    items
      .map((item) => {
        const book = resolveBook(item.bookId)
        return book ? { book, quantity: item.quantity } : null
      })
      .filter(
        (item): item is { book: Book; quantity: number } => item !== null,
      )

  return (
    <CartContext.Provider
      value={{
        items,
        isSyncing,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        getCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
