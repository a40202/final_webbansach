'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Check, CreditCard, Banknote, ChevronLeft, Tag, X } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { useRequireAuth } from '@/lib/auth-context'
import { formatPrice } from '@/lib/data'
import { ordersApi, promotionsApi, ApiError, type PromotionDiscountResult } from '@/lib/api'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const { getCartItems, getCartTotal, clearCart, isSyncing } = useCart()
  const { user, isLoading: authLoading } = useRequireAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<PromotionDiscountResult | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  
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
  const discount = appliedPromo?.discount ?? 0
  const total = Math.max(0, subtotal + shippingFee - discount)

  const handleApplyPromo = async () => {
    const code = promoInput.trim()
    if (!code) {
      toast.error('Vui lòng nhập mã giảm giá')
      return
    }
    setPromoLoading(true)
    try {
      const result = await promotionsApi.validate(code, subtotal, shippingFee)
      setAppliedPromo(result)
      toast.success(`Đã áp dụng: ${result.title}`)
    } catch (e) {
      setAppliedPromo(null)
      const msg = e instanceof ApiError ? e.message : 'Mã giảm giá không hợp lệ'
      toast.error(msg)
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoInput('')
  }

  useEffect(() => {
    if (!authLoading && user && !isSyncing && cartItems.length === 0) {
      router.replace('/cart')
    }
  }, [authLoading, user, isSyncing, cartItems.length, router])

  if (authLoading || !user || isSyncing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }

    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt hàng')
      router.push('/login')
      return
    }

    setIsLoading(true)

    try {
      const order = await ordersApi.create({
        items: cartItems.map(({ book, quantity }) => ({
          bookId: book.id,
          quantity,
        })),
        shippingAddress: formData.address,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        shippingFee,
        buyerName: formData.fullName,
        buyerEmail: formData.email,
        note: formData.note,
        promotionCode: appliedPromo?.code,
      })
      clearCart()
      toast.success('Đặt hàng thành công!')
      router.push(`/order-success?orderId=${order.id}`)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Đặt hàng thất bại'
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
            Quay lại giỏ hàng
          </Link>

          <h1 className="font-serif text-3xl font-semibold mb-8" data-testid="checkout-heading">
            Thanh toán
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shipping info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact info */}
                <div className="bg-card rounded-lg p-6 border">
                  <h2 className="font-semibold text-lg mb-4">Thông tin liên hệ</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ tên *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại *</Label>
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
                  <h2 className="font-semibold text-lg mb-4">Địa chỉ giao hàng</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ chi tiết *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                      <Textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="Ghi chú thêm về đơn hàng hoặc yêu cầu giao hàng..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Promotion code */}
                <div className="bg-card rounded-lg p-6 border">
                  <h2 className="font-semibold text-lg mb-4">Mã giảm giá</h2>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between gap-3 p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <Tag className="h-5 w-5 text-green-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-green-800">{appliedPromo.code}</p>
                          <p className="text-sm text-green-700 truncate">{appliedPromo.title}</p>
                          <p className="text-sm font-medium text-green-800">
                            Giảm {formatPrice(appliedPromo.discount)}
                            {appliedPromo.appliesTo === 'shipping' ? ' (phí ship)' : ''}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemovePromo}
                        aria-label="Xóa mã giảm giá"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Nhập mã (VD: BOOK20)"
                        className="uppercase"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleApplyPromo()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleApplyPromo}
                        disabled={promoLoading}
                      >
                        {promoLoading ? 'Đang kiểm tra...' : 'Áp dụng'}
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Mã mẫu: BOOK20 (giảm 20%), FREESHIP (miễn phí ship), WEEKEND15 (giảm 15%)
                  </p>
                </div>

                {/* Payment method */}
                <div className="bg-card rounded-lg p-6 border">
                  <h2 className="font-semibold text-lg mb-4">Phương thức thanh toán</h2>
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
                          <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                          <p className="text-sm text-muted-foreground">
                            Thanh toán bằng tiền mặt khi nhận được hàng
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label htmlFor="transfer" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Chuyển khoản ngân hàng</p>
                          <p className="text-sm text-muted-foreground">
                            Chuyển khoản qua tài khoản ngân hàng
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.paymentMethod === 'transfer' && (
                    <div className="mt-4 p-4 bg-secondary rounded-lg">
                      <p className="font-medium mb-2">Thông tin chuyển khoản:</p>
                      <div className="text-sm space-y-1">
                        <p>Ngân hàng: <span className="font-medium">Vietcombank</span></p>
                        <p>Số tài khoản: <span className="font-medium">1234567890</span></p>
                        <p>Chủ tài khoản: <span className="font-medium">CÔNG TY BOOKSTORE</span></p>
                        <p>Nội dung: <span className="font-medium">[Số điện thoại] - [Họ tên]</span></p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg p-6 border sticky top-24">
                  <h2 className="font-semibold text-lg mb-4">Đơn hàng của bạn</h2>
                  
                  {/* Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cartItems.map(({ book, quantity }) => (
                      <div key={book.id} className="flex gap-3" data-testid="checkout-item">
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
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span>
                        {shippingFee === 0 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá ({appliedPromo?.code})</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-accent">{formatPrice(total)}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={isLoading}
                    data-testid="checkout-submit"
                  >
                    {isLoading ? (
                      'Đang xử lý...'
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Đặt hàng
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Bằng việc đặt hàng, bạn đồng ý với các điều khoản và điều kiện của chúng tôi.
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