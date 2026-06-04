'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronRight 
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BookCard } from '@/components/book-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/lib/cart-context'
import { toast } from 'sonner'
import { formatPrice, type Book, type Review } from '@/lib/data'
import { booksApi, reviewsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const features = [
  { icon: Truck, label: 'Giao hàng toàn quốc' },
  { icon: Shield, label: 'Bảo hành chất lượng' },
  { icon: RotateCcw, label: 'Đổi trả trong 7 ngày' },
]

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [book, setBook] = useState<Book | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      booksApi.getById(id),
      reviewsApi.getByBook(id),
    ])
      .then(async ([bookData, reviewData]) => {
        setBook(bookData)
        setReviews(reviewData)
        const all = await booksApi.getAll()
        setRelatedBooks(
          all
            .filter((b) => b.category === bookData.category && b.id !== bookData.id)
            .slice(0, 4),
        )
      })
      .catch(() => {
        setBook(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
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

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Không tìm thấy sách</h1>
            <p className="text-muted-foreground mt-2">Sách bạn tìm kiếm không tồn tại.</p>
            <Link href="/books">
              <Button className="mt-4">Quay lại cửa hàng</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0

  const handleAddToCart = () => {
    addToCart(book.id, quantity, book)
    toast.success(`Đã thêm ${quantity} cuốn "${book.title}" vào giỏ hàng`)
  }

  const handleBuyNow = () => {
    addToCart(book.id, quantity, book)
    router.push('/cart')
  }

  const hasReviewed = !!user && reviews.some((r) => r.userId === user.id)

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá')
      router.push('/login')
      return
    }
    if (hasReviewed) {
      toast.error('Bạn đã đánh giá sách này rồi')
      return
    }
    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá')
      return
    }
    setSubmittingReview(true)
    try {
      await reviewsApi.create({
        bookId: id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      })
      const [bookData, reviewData] = await Promise.all([
        booksApi.getById(id),
        reviewsApi.getByBook(id),
      ])
      setBook(bookData)
      setReviews(reviewData)
      setReviewRating(5)
      setReviewComment('')
      toast.success('Cảm ơn bạn đã đánh giá!')
    } catch (e: any) {
      toast.error(e?.message || 'Không thể gửi đánh giá')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Calculate rating distribution (mock)
  const ratingDistribution = [
    { stars: 5, percentage: 70 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 7 },
    { stars: 2, percentage: 2 },
    { stars: 1, percentage: 1 },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Trang chủ</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/books" className="hover:text-foreground">Sách</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/books?category=${book.category.toLowerCase().replace(/ /g, '-')}`} className="hover:text-foreground">
              {book.category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{book.title}</span>
          </nav>

          {/* Product details */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] bg-secondary rounded-lg overflow-hidden">
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  className="object-cover"
                  priority
                />
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                    -{discount}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-2xl lg:text-3xl font-semibold">{book.title}</h1>
                <p className="text-muted-foreground mt-2">Tác giả: <span className="text-foreground">{book.author}</span></p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(book.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{book.rating}</span>
                <span className="text-muted-foreground">({book.reviewCount} đánh giá)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-accent">{formatPrice(book.price)}</span>
                {book.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(book.originalPrice)}
                  </span>
                )}
              </div>

              <Separator />

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Số lượng</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                      disabled={quantity >= book.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {book.stock} sản phẩm có sẵn
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleAddToCart} variant="outline" size="lg" className="flex-1">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Thêm vào giỏ
                </Button>
                <Button onClick={handleBuyNow} size="lg" className="flex-1">
                  Mua ngay
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {features.map((feature) => (
                  <div key={feature.label} className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-secondary rounded-full mb-2">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">{feature.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mt-12">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Mô tả
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Chi tiết
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Đánh giá ({book.reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">{book.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">NXB</span>
                  <span className="font-medium">{book.publisher}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Năm XB</span>
                  <span className="font-medium">{book.publishYear}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Số trang</span>
                  <span className="font-medium">{book.pages}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Ngôn ngữ</span>
                  <span className="font-medium">{book.language}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Thể loại</span>
                  <span className="font-medium">{book.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">ISBN</span>
                  <span className="font-medium">{book.isbn}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Rating summary */}
                <div className="lg:col-span-1">
                  <div className="bg-secondary p-6 rounded-lg">
                    <div className="text-center mb-4">
                      <span className="text-5xl font-bold">{book.rating}</span>
                      <span className="text-2xl text-muted-foreground">/5</span>
                    </div>
                    <div className="flex justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(book.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      {book.reviewCount} đánh giá
                    </p>

                    <div className="space-y-2 mt-6">
                      {ratingDistribution.map((item) => (
                        <div key={item.stars} className="flex items-center gap-2">
                          <span className="text-sm w-12">{item.stars} sao</span>
                          <Progress value={item.percentage} className="h-2 flex-1" />
                          <span className="text-sm text-muted-foreground w-10">
                            {item.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reviews list */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Create review */}
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium">Viết đánh giá</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {user
                            ? hasReviewed
                              ? 'Bạn đã đánh giá sản phẩm này.'
                              : 'Chia sẻ cảm nhận của bạn về cuốn sách này.'
                            : 'Đăng nhập để gửi đánh giá.'}
                        </p>
                      </div>
                      {!user && (
                        <Button variant="outline" onClick={() => router.push('/login')}>
                          Đăng nhập
                        </Button>
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground w-20">Số sao</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              disabled={!user || hasReviewed || submittingReview}
                              onClick={() => setReviewRating(s)}
                              className="disabled:opacity-50"
                              aria-label={`${s} sao`}
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  s <= reviewRating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <Textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Nhập nội dung đánh giá..."
                        disabled={!user || hasReviewed || submittingReview}
                      />

                      <div className="flex justify-end">
                        <Button
                          onClick={handleSubmitReview}
                          disabled={!user || hasReviewed || submittingReview}
                        >
                          Gửi đánh giá
                        </Button>
                      </div>
                    </div>
                  </div>

                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>{review.userName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{review.userName}</h4>
                              <span className="text-sm text-muted-foreground">
                                {review.createdAt}
                              </span>
                            </div>
                            <div className="flex gap-0.5 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="mt-2 text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Chưa có đánh giá nào cho sản phẩm này.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Related books */}
          {relatedBooks.length > 0 && (
            <section className="mt-16">
              <h2 className="font-serif text-2xl font-semibold mb-6">Sách liên quan</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}