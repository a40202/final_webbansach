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

      <h1 className="font-serif text-3xl font-semibold mb-2">Dat hang thanh cong!</h1>
      <p className="text-muted-foreground mb-8">
        Cam on ban da dat hang. Hoa don thanh toan da duoc tao tu dong.
      </p>

      <div className="bg-secondary p-6 rounded-lg mb-8 text-left">
        <div className="flex items-start gap-4">
          <Package className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium mb-1">Buoc tiep theo</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Hoa don da luu trong he thong</li>
              <li>Chung toi se lien he xac nhan trong 24h</li>
              <li>Theo doi don hang tai muc Don hang cua toi</li>
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
          <Button variant="outline">Xem don hang</Button>
        </Link>
        <Link href="/books">
          <Button variant="ghost">
            Tiep tuc mua sam
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
        <Suspense fallback={<p className="text-muted-foreground">Dang tai...</p>}>
          <OrderSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
