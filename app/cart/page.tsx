'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/data'

export default function CartPage() {
  const { getCartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()
  const cartItems = getCartItems()
  const total = getCartTotal()
  const shippingFee = total >= 300000 ? 0 : 30000
  const finalTotal = total + shippingFee

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold">Giỏ hàng trống</h1>
            <p className="text-muted-foreground mt-2 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng.
            </p>
            <Link href="/books">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-serif text-3xl font-semibold mb-8">Giỏ hàng</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Tổng</div>
              </div>

              <Separator />

              {/* Items */}
              {cartItems.map(({ book, quantity }) => (
                <div key={book.id} className="bg-card rounded-lg p-4 border">
                  <div className="grid sm:grid-cols-12 gap-4 items-center">
                    {/* Product */}
                    <div className="sm:col-span-6 flex gap-4">
                      <Link href={`/books/${book.id}`} className="flex-shrink-0">
                        <div className="relative w-20 h-28 rounded-md overflow-hidden bg-secondary">
                          <Image
                            src={book.coverImage}
                            alt={book.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                      <div className="min-w-0">
                        <Link href={`/books/${book.id}`} className="font-medium hover:text-accent line-clamp-2">
                          {book.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(book.id)}
                          className="text-destructive hover:text-destructive h-auto p-0 mt-2"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="sm:col-span-2 text-center">
                      <span className="sm:hidden text-muted-foreground mr-2">Giá:</span>
                      <span className="font-medium">{formatPrice(book.price)}</span>
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2 flex justify-center">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(book.id, quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(book.id, quantity + 1)}
                          disabled={quantity >= book.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="sm:col-span-2 text-right">
                      <span className="sm:hidden text-muted-foreground mr-2">Tổng:</span>
                      <span className="font-semibold text-accent">
                        {formatPrice(book.price * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/books">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Tiếp tục mua sắm
                  </Button>
                </Link>
                <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa giỏ hàng
                </Button>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 border sticky top-24">
                <h2 className="font-semibold text-lg mb-4">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                  {total < 300000 && (
                    <p className="text-xs text-muted-foreground">
                      Mua thêm {formatPrice(300000 - total)} để được miễn phí vận chuyển
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-accent">{formatPrice(finalTotal)}</span>
                </div>

                <Link href="/checkout" className="block mt-6">
                  <Button className="w-full" size="lg">
                    Tiến hành thanh toán
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}