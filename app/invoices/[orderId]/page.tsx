'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, FileText, Printer } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useRequireAuth } from '@/lib/auth-context'
import { invoicesApi, type Invoice } from '@/lib/api'
import { formatPrice } from '@/lib/data'

const paymentStatusLabel: Record<string, string> = {
  unpaid: 'Chua thanh toan',
  paid: 'Da thanh toan',
  refunded: 'Da hoan tien',
}

export default function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = use(params)
  const { user, isLoading: authLoading } = useRequireAuth()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    invoicesApi
      .getByOrder(orderId)
      .then(setInvoice)
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false))
  }, [user, orderId])

  if (authLoading || !user) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Dang tai hoa don...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Khong tim thay hoa don</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex justify-between items-center mb-6 print:hidden">
            <Link
              href="/orders"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Don hang
            </Link>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              In hoa don
            </Button>
          </div>

          <div className="bg-card border rounded-lg p-8 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 text-primary mb-2">
                  <FileText className="h-6 w-6" />
                  <span className="font-bold text-lg">BookStore</span>
                </div>
                <p className="text-sm text-muted-foreground">Hoa don ban hang</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-lg">{invoice.id}</p>
                <p className="text-sm text-muted-foreground">
                  Don: {invoice.orderId}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(invoice.issuedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8 text-sm">
              <div>
                <p className="font-medium mb-1">Nguoi mua</p>
                <p>{invoice.buyerName}</p>
                <p className="text-muted-foreground">{invoice.buyerEmail}</p>
                <p className="text-muted-foreground">{invoice.buyerPhone}</p>
                <p className="text-muted-foreground">{invoice.buyerAddress}</p>
              </div>
              <div>
                <p className="font-medium mb-1">Thanh toan</p>
                <p>
                  {invoice.paymentMethod === 'cash'
                    ? 'Tien mat (COD)'
                    : 'Chuyen khoan'}
                </p>
                <p
                  className={
                    invoice.paymentStatus === 'paid'
                      ? 'text-green-600 font-medium'
                      : 'text-yellow-600 font-medium'
                  }
                >
                  {paymentStatusLabel[invoice.paymentStatus]}
                </p>
              </div>
            </div>

            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">San pham</th>
                  <th className="text-center py-2">SL</th>
                  <th className="text-right py-2">Don gia</th>
                  <th className="text-right py-2">Thanh tien</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.bookId} className="border-b border-border/50">
                    <td className="py-3">{item.bookTitle}</td>
                    <td className="text-center py-3">{item.quantity}</td>
                    <td className="text-right py-3">
                      {formatPrice(item.unitPrice)}
                    </td>
                    <td className="text-right py-3">
                      {formatPrice(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tam tinh</span>
                <span>{formatPrice(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phi van chuyen</span>
                <span>{formatPrice(invoice.shippingFee)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giam gia</span>
                  <span>-{formatPrice(invoice.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Tong cong</span>
                <span className="text-primary">
                  {formatPrice(invoice.totalAmount)}
                </span>
              </div>
            </div>

            {invoice.note && (
              <p className="text-sm text-muted-foreground mt-6">
                Ghi chu: {invoice.note}
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
