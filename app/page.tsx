import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, Truck, CreditCard, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BookCard } from '@/components/book-card'
import {
  categories,
  getFeaturedBooks,
  getNewArrivals,
  getBestSellers,
} from '@/lib/data'

const features = [
  {
    icon: Truck,
    title: 'Miễn phí vận chuyển',
    description: 'Cho đơn hàng từ 300.000đ',
  },
  {
    icon: CreditCard,
    title: 'Thanh toán an toàn',
    description: 'Nhiều phương thức thanh toán',
  },
  {
    icon: BookOpen,
    title: 'Sách chính hãng',
    description: '100% sách mới nguyên seal',
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ 24/7',
    description: 'Giải đáp mọi thắc mắc',
  },
]

export default function HomePage() {
  const featuredBooks = getFeaturedBooks()
  const newArrivals = getNewArrivals()
  const bestSellers = getBestSellers()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-secondary overflow-hidden">
          <div className="container mx-auto px-4 py-12 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="max-w-xl">
                <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl font-semibold leading-tight text-balance">
                  Khám phá thế giới qua từng trang sách
                </h1>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  Hàng ngàn đầu sách hay đang chờ bạn. Từ văn học kinh điển đến sách kinh doanh hiện đại, tất cả đều có tại BookStore.
                </p>
                <div className="flex flex-wrap gap-4 mt-8">
                  <Link href="/books">
                    <Button size="lg" className="h-12 px-8">
                      Khám phá ngay
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/categories">
                    <Button variant="outline" size="lg" className="h-12 px-8">
                      Xem thể loại
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="relative aspect-square max-w-lg mx-auto">
                  <div className="absolute inset-0 bg-accent/10 rounded-full" />
                  <div className="absolute top-8 left-8 w-40 h-56 rounded-lg shadow-xl overflow-hidden transform -rotate-6">
                    <Image
                      src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop"
                      alt="Book 1"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute top-4 right-12 w-44 h-60 rounded-lg shadow-xl overflow-hidden transform rotate-3">
                    <Image
                      src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop"
                      alt="Book 2"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-64 rounded-lg shadow-xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop"
                      alt="Book 3"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Books */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-2xl lg:text-3xl font-semibold">
                  Sách nổi bật
                </h2>
                <p className="text-muted-foreground mt-1">
                  Những cuốn sách được yêu thích nhất
                </p>
              </div>
              <Link href="/books?filter=featured">
                <Button variant="ghost" className="hidden sm:flex">
                  Xem tất cả
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {featuredBooks.slice(0, 5).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 lg:py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl lg:text-3xl font-semibold">
                Danh mục sách
              </h2>
              <p className="text-muted-foreground mt-2">
                Tìm sách theo thể loại yêu thích của bạn
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/books?category=${category.slug}`}
                  className="group p-6 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <h3 className="font-medium group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.bookCount} cuốn sách
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Best Sellers */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-2xl lg:text-3xl font-semibold">
                  Sách bán chạy
                </h2>
                <p className="text-muted-foreground mt-1">
                  Top sách được mua nhiều nhất
                </p>
              </div>
              <Link href="/books?filter=bestseller">
                <Button variant="ghost" className="hidden sm:flex">
                  Xem tất cả
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {bestSellers.slice(0, 5).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-12 lg:py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-2xl lg:text-3xl font-semibold">
                  Sách mới
                </h2>
                <p className="text-muted-foreground mt-1">
                  Những đầu sách mới nhất
                </p>
              </div>
              <Link href="/books?filter=new">
                <Button variant="ghost" className="hidden sm:flex">
                  Xem tất cả
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {newArrivals.slice(0, 5).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-semibold max-w-2xl mx-auto text-balance">
              Đăng ký để nhận ưu đãi độc quyền
            </h2>
            <p className="mt-4 text-primary-foreground/80 max-w-lg mx-auto">
              Nhận thông báo về sách mới, chương trình khuyến mãi và nhiều ưu đãi hấp dẫn khác.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 h-12 px-4 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary-foreground/50"
              />
              <Button
                variant="secondary"
                size="lg"
                className="h-12 px-8"
              >
                Đăng ký
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}