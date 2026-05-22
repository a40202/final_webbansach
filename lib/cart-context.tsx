'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem, Book, getBookById } from '@/lib/data'

interface CartContextType {
  items: CartItem[]
  addToCart: (bookId: string, quantity?: number) => void
  removeFromCart: (bookId: string) => void
  updateQuantity: (bookId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  getCartItems: () => { book: Book; quantity: number }[]
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addToCart = (bookId: string, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.bookId === bookId)
      if (existingItem) {
        return prevItems.map(item =>
          item.bookId === bookId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevItems, { bookId, quantity }]
    })
  }

  const removeFromCart = (bookId: string) => {
    setItems(prevItems => prevItems.filter(item => item.bookId !== bookId))
  }

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId)
      return
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.bookId === bookId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const book = getBookById(item.bookId)
      return total + (book?.price || 0) * item.quantity
    }, 0)
  }

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  const getCartItems = () => {
    return items
      .map(item => {
        const book = getBookById(item.bookId)
        return book ? { book, quantity: item.quantity } : null
      })
      .filter((item): item is { book: Book; quantity: number } => item !== null)
  }

  return (
    <CartContext.Provider
      value={{
        items,
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
