'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Percent, Tag, Copy, Check } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { promotionsApi, type Promotion } from '@/lib/api'
import { toast } from 'sonner'

export default function SalePage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    promotionsApi
      .getActive()
      .then(setPromotions)
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false))
  }, [])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Da sao chep ma khuyen mai')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-secondary py-12">
          <div className="container mx-auto px-4 text-center">
            <Percent className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-serif text-3xl lg:text-4xl font-semibold">Khuyen mai</h1>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Uu dai doc quyen khi mua sach tai BookStore
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          {loading ? (
            <p className="text-center text-muted-foreground">Dang tai khuyen mai...</p>
          ) : promotions.length === 0 ? (
            <p className="text-center text-muted-foreground">Hien chua co chuong trinh khuyen mai</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  {p.imageUrl && (
                    <div className="relative h-40">
                      <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
                    </div>
                  )}
                  <CardContent className="p-6 space-y-3">
                    <Badge variant="secondary">
                      {p.discountType === 'percent'
                        ? `Giam ${p.discountValue}%`
                        : `Giam ${p.discountValue.toLocaleString('vi-VN')}d`}
                    </Badge>
                    <h2 className="font-semibold text-lg">{p.title}</h2>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                    {p.minOrder && (
                      <p className="text-xs text-muted-foreground">
                        Don toi thieu: {p.minOrder.toLocaleString('vi-VN')}d
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      HSD: {p.endDate}
                    </p>
                    {p.code && (
                      <div className="flex items-center gap-2 pt-2">
                        <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                          {p.code}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyCode(p.code!)}
                        >
                          {copiedCode === p.code ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                    <Button asChild className="w-full">
                      <Link href="/books">
                        <Tag className="h-4 w-4 mr-2" />
                        Mua ngay
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
