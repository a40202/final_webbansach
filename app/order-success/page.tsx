'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, ArrowRight, FileText } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="text-center px-4 py-16 max-w-lg mx-auto">
      <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      <h1 className="font-serif text-3xl font-semibold mb-2">Đặt hàng thành công!</h1>
      <p className="text-muted-foreground mb-8">
        Cảm ơn bạn đã đặt hàng. Hóa đơn thanh toán đã được tạo tự động.
      </p>

      <div className="bg-secondary p-6 rounded-lg mb-8 text-left">
        <div className="flex items-start gap-4">
          <Package className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium mb-1">Bước tiếp theo</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Hóa đơn đã lưu trong hệ thống</li>
              <li>Chúng tôi sẽ liên hệ xác nhận trong 24h</li>
              <li>Theo dõi đơn hàng tại mục Đơn hàng của tôi</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderId && (
          <Link href={`/invoices/${orderId}`}>
            <Button variant="default">
              <FileText className="h-4 w-4 mr-2" />
              Xem hoa don
            </Button>
          </Link>
        )}
        <Link href="/orders">
          <Button variant="outline">Xem đơn hàng</Button>
        </Link>
        <Link href="/books">
          <Button variant="ghost">
            Tiếp tục mua sắm
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<p className="text-muted-foreground">Đang tải...</p>}>
          <OrderSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
