'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Package,
  ChevronRight,
  Eye,
  X,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'
import {
  orders as mockOrders,
  getBookById,
  formatPrice,
} from '@/lib/data'
import type { Order } from '@/lib/data'
import { toast } from 'sonner'

const statusSteps = [
  { key: 'pending', label: 'Chờ xác nhận', icon: Clock },
  { key: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle2 },
  { key: 'shipping', label: 'Đang giao hàng', icon: Truck },
  { key: 'delivered', label: 'Đã giao hàng', icon: PackageCheck },
]

function getStatusIndex(status: Order['status']) {
  if (status === 'cancelled') return -1
  return statusSteps.findIndex((s) => s.key === status)
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const cfg = {
    pending: { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Đã xác nhận', cls: 'bg-blue-100 text-blue-800' },
    shipping: { label: 'Đang giao hàng', cls: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Đã giao hàng', cls: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-800' },
  }
  const { label, cls } = cfg[status] || cfg.pending
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}

function OrderTimeline({ status }: { status: Order['status'] }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-red-700 text-sm">Đơn hàng đã bị hủy</p>
          <p className="text-xs text-red-500 mt-0.5">
            Hoàn tiền sẽ được xử lý trong 3-5 ngày làm việc
          </p>
        </div>
      </div>
    )
  }

  const currentIdx = getStatusIndex(status)
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground mb-3">Theo dõi trạng thái đơn hàng</p>
      <div className="flex items-start gap-0">
        {statusSteps.map((step, idx) => {
          const Icon = step.icon
          const done = idx <= currentIdx
          const active = idx === currentIdx
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center">
              <div className="relative w-full flex items-center">
                {/* Line before */}
                {idx > 0 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      idx <= currentIdx ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                    done
                      ? active
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-primary/20 border-primary text-primary'
                      : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {/* Line after */}
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      idx < currentIdx ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
              <p
                className={`text-xs mt-1.5 text-center leading-tight px-1 ${
                  active
                    ? 'font-semibold text-primary'
                    : done
                    ? 'text-primary/70'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orderList, setOrderList] = useState(
    mockOrders.filter((o) => o.userId === (user?.id ?? ''))
  )
  const [statusFilter, setStatusFilter] = useState<string>('all')

  if (!user) {
    router.push('/login')
    return null
  }

  const filtered =
    statusFilter === 'all'
      ? orderList
      : orderList.filter((o) => o.status === statusFilter)

  const handleCancelOrder = (orderId: string) => {
    setOrderList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'cancelled' as const, updatedAt: new Date().toISOString().split('T')[0] }
          : o
      )
    )
    toast.success('Đã hủy đơn hàng. Hoàn tiền sẽ được xử lý trong 3–5 ngày làm việc.')
  }

  if (orderList.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold">Chưa có đơn hàng</h1>
            <p className="text-muted-foreground mt-2 mb-6">
              Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!
            </p>
            <Link href="/books">
              <Button>Mua sắm ngay</Button>
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

      <main className="flex-1 bg-secondary/50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Trang chủ</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/profile" className="hover:text-foreground">Tài khoản</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Đơn hàng</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="font-serif text-3xl font-semibold">Đơn hàng của tôi</h1>
            <p className="text-sm text-muted-foreground">{orderList.length} đơn hàng</p>
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-2 flex-wrap mb-6">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'pending', label: 'Chờ xác nhận' },
              { value: 'confirmed', label: 'Đã xác nhận' },
              { value: 'shipping', label: 'Đang giao' },
              { value: 'delivered', label: 'Đã giao' },
              { value: 'cancelled', label: 'Đã hủy' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border hover:bg-muted'
                }`}
              >
                {tab.label}
                {tab.value !== 'all' && (
                  <span className="ml-1 text-xs">
                    ({orderList.filter((o) => o.status === tab.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Orders list */}
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground bg-card rounded-lg border">
                Không có đơn hàng nào
              </div>
            )}
            {filtered.map((order) => (
              <div key={order.id} className="bg-card rounded-lg border overflow-hidden">
                {/* Order header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-secondary/50 border-b">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-semibold">#{order.id}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{order.createdAt}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex gap-2">
                    {/* Detail dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Chi tiết đơn hàng #{order.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5">
                          {/* Timeline */}
                          <OrderTimeline status={order.status} />

                          <Separator />

                          {/* Items */}
                          <div>
                            <h4 className="font-medium mb-3">Sản phẩm</h4>
                            <div className="space-y-3">
                              {order.items.map((item) => {
                                const book = getBookById(item.bookId)
                                if (!book) return null
                                return (
                                  <div key={item.bookId} className="flex gap-3">
                                    <div className="relative w-14 h-20 rounded overflow-hidden bg-secondary flex-shrink-0">
                                      <Image
                                        src={book.coverImage}
                                        alt={book.title}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm line-clamp-2">{book.title}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {formatPrice(item.price)} × {item.quantity}
                                      </p>
                                    </div>
                                    <p className="font-medium text-sm whitespace-nowrap">
                                      {formatPrice(item.price * item.quantity)}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          <Separator />

                          {/* Shipping */}
                          <div>
                            <h4 className="font-medium mb-2">Thông tin giao hàng</h4>
                            <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                            <p className="text-sm text-muted-foreground">SĐT: {order.phone}</p>
                          </div>

                          <Separator />

                          {/* Payment & total */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Phương thức thanh toán</span>
                              <span>{order.paymentMethod === 'cash' ? 'Tiền mặt (COD)' : 'Chuyển khoản'}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Tổng tiền</span>
                              <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                            </div>
                          </div>

                          {/* Cancel inside dialog */}
                          {order.status === 'pending' && (
                            <>
                              <Separator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" className="w-full" size="sm">
                                    <X className="h-4 w-4 mr-2" />
                                    Hủy đơn hàng này
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận hủy đơn hàng?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn hủy đơn hàng{' '}
                                      <strong>#{order.id}</strong>?
                                      {order.paymentMethod === 'transfer' && (
                                        <span className="block mt-2 text-orange-600">
                                          <RotateCcw className="inline h-3.5 w-3.5 mr-1" />
                                          Hoàn tiền sẽ được xử lý trong 3–5 ngày làm việc.
                                        </span>
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Không hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleCancelOrder(order.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Xác nhận hủy
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Cancel button in list */}
                    {order.status === 'pending' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Hủy
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận hủy đơn hàng?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hủy đơn hàng <strong>#{order.id}</strong>?{' '}
                              {order.paymentMethod === 'transfer' && (
                                <span className="block mt-1 text-orange-600">
                                  Hoàn tiền sẽ được xử lý trong 3–5 ngày làm việc.
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Không</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelOrder(order.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Hủy đơn hàng
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>

                {/* Items preview */}
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                      {order.items.slice(0, 2).map((item) => {
                        const book = getBookById(item.bookId)
                        if (!book) return null
                        return (
                          <div key={item.bookId} className="flex gap-3">
                            <div className="relative w-12 h-16 rounded overflow-hidden bg-secondary flex-shrink-0">
                              <Image
                                src={book.coverImage}
                                alt={book.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/books/${book.id}`}
                                className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors"
                              >
                                {book.title}
                              </Link>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatPrice(item.price)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      {order.items.length > 2 && (
                        <p className="text-xs text-muted-foreground pl-1">
                          + {order.items.length - 2} sản phẩm khác
                        </p>
                      )}
                    </div>

                    {/* Total + refund notice */}
                    <div className="sm:text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">Tổng tiền</p>
                      <p className="text-lg font-semibold text-primary">
                        {formatPrice(order.totalAmount)}
                      </p>
                      {order.status === 'cancelled' && order.paymentMethod === 'transfer' && (
                        <p className="text-xs text-orange-500 mt-1 flex items-center justify-end gap-1">
                          <RotateCcw className="h-3 w-3" />
                          Đang hoàn tiền
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
