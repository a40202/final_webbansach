'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Check, CreditCard, Banknote, ChevronLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { formatPrice } from '@/lib/data'
import { ordersApi, ApiError } from '@/lib/api'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const { getCartItems, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    note: '',
    paymentMethod: 'cash' as 'cash' | 'transfer',
  })

  const cartItems = getCartItems()
  const subtotal = getCartTotal()
  const shippingFee = subtotal >= 300000 ? 0 : 30000
  const total = subtotal + shippingFee

  if (cartItems.length === 0) {
    router.push('/cart')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error('Vui long dien day du thong tin giao hang')
      return
    }

    if (!user) {
      toast.error('Vui long dang nhap de dat hang')
      router.push('/login')
      return
    }

    setIsLoading(true)

    try {
      await ordersApi.create({
        items: cartItems.map(({ book, quantity }) => ({
          bookId: book.id,
          quantity,
        })),
        shippingAddress: formData.address,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        shippingFee,
      })
      clearCart()
      toast.success('Dat hang thanh cong!')
      router.push('/order-success')
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Dat hang that bai'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-secondary/50">
        <div className="container mx-auto px-4 py-8">
          {/* Back link */}
          <Link href="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Quay lai gio hang
          </Link>

          <h1 className="font-serif text-3xl font-semibold mb-8">Thanh toan</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shipping info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact info */}
                <div className="bg-card rounded-lg p-6 border">
                  <h2 className="font-semibold text-lg mb-4">Thong tin lien he</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Ho ten *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nguyen Van A"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">So dien thoai *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0901234567"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping address */}
                <div className="bg-card rounded-lg p-6 border">
                  <h2 className="font-semibold text-lg mb-4">Dia chi giao hang</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Dia chi chi tiet *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="So nha, ten duong, phuong/xa, quan/huyen, tinh/thanh pho"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note">Ghi chu (tuy chon)</Label>
                      <Textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="Ghi chu them ve don hang hoac giao hang..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div className="bg-card rounded-lg p-6 border">
                  <h2 className="font-semibold text-lg mb-4">Phuong thuc thanh toan</h2>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value: 'cash' | 'transfer') => 
                      setFormData({ ...formData, paymentMethod: value })
                    }
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Banknote className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Thanh toan khi nhan hang (COD)</p>
                          <p className="text-sm text-muted-foreground">
                            Thanh toan bang tien mat khi nhan duoc hang
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label htmlFor="transfer" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Chuyen khoan ngan hang</p>
                          <p className="text-sm text-muted-foreground">
                            Chuyen khoan qua tai khoan ngan hang
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.paymentMethod === 'transfer' && (
                    <div className="mt-4 p-4 bg-secondary rounded-lg">
                      <p className="font-medium mb-2">Thong tin chuyen khoan:</p>
                      <div className="text-sm space-y-1">
                        <p>Ngan hang: <span className="font-medium">Vietcombank</span></p>
                        <p>So tai khoan: <span className="font-medium">1234567890</span></p>
                        <p>Chu tai khoan: <span className="font-medium">CONG TY BOOKSTORE</span></p>
                        <p>Noi dung: <span className="font-medium">[So dien thoai] - [Ho ten]</span></p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg p-6 border sticky top-24">
                  <h2 className="font-semibold text-lg mb-4">Don hang cua ban</h2>
                  
                  {/* Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cartItems.map(({ book, quantity }) => (
                      <div key={book.id} className="flex gap-3">
                        <div className="relative w-14 h-20 rounded overflow-hidden bg-secondary flex-shrink-0">
                          <Image
                            src={book.coverImage}
                            alt={book.title}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                            {quantity}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium line-clamp-2">{book.title}</p>
                          <p className="text-sm text-muted-foreground">{formatPrice(book.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tam tinh</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phi van chuyen</span>
                      <span>
                        {shippingFee === 0 ? (
                          <span className="text-green-600">Mien phi</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tong cong</span>
                    <span className="text-accent">{formatPrice(total)}</span>
                  </div>

                  <Button type="submit" className="w-full mt-6" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      'Dang xu ly...'
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Dat hang
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Bang viec dat hang, ban dong y voi cac dieu khoan va dieu kien cua chung toi.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
