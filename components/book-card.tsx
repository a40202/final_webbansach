'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Book, formatPrice } from '@/lib/data'
import { useCart } from '@/lib/cart-context'
import { toast } from 'sonner'

interface BookCardProps {
  book: Book
  variant?: 'default' | 'compact'
}

export function BookCard({ book, variant = 'default' }: BookCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(book.id)
    toast.success(`Da them "${book.title}" vao gio hang`)
  }

  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0

  if (variant === 'compact') {
    return (
      <Link href={`/books/${book.id}`}>
        <Card className="group overflow-hidden border-0 bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="flex gap-4 p-4">
              <div className="relative w-20 h-28 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-accent transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                <p className="font-semibold text-accent mt-2">{formatPrice(book.price)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/books/${book.id}`}>
      <Card className="group overflow-hidden border-0 bg-card shadow-sm hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discount > 0 && (
                <Badge className="bg-accent text-accent-foreground text-xs">
                  -{discount}%
                </Badge>
              )}
              {book.isNewArrival && (
                <Badge variant="secondary" className="text-xs">
                  Moi
                </Badge>
              )}
              {book.isBestSeller && (
                <Badge variant="outline" className="bg-card/90 text-xs">
                  Ban chay
                </Badge>
              )}
            </div>
            {/* Quick add button */}
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-primary/95 hover:bg-primary"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Them vao gio
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-medium text-sm line-clamp-2 min-h-[40px] group-hover:text-accent transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">{book.author}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mt-2">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{book.rating}</span>
              <span className="text-xs text-muted-foreground">
                ({book.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 mt-2">
              <span className="font-semibold text-accent">{formatPrice(book.price)}</span>
              {book.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(book.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
