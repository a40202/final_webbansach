"use client"

import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { categories, books } from "@/lib/data"
import { BookOpen, ChevronRight } from "lucide-react"

export default function CategoriesPage() {
  const getCategoryBookCount = (categoryId: string) => {
    return books.filter(book => book.categoryId === categoryId).length
  }

  const getCategoryBooks = (categoryId: string) => {
    return books.filter(book => book.categoryId === categoryId).slice(0, 4)
  }

  const categoryImages: Record<string, string> = {
    "1": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    "2": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "3": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    "4": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    "5": "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800&q=80",
    "6": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80",
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary transition-colors">
                Trang chủ
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Danh mục sách</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Danh mục sách
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Khám phá bộ sưu tập sách đa dạng của chúng tôi, được phân loại theo nhiều thể loại 
              khác nhau để bạn dễ dàng tìm kiếm cuốn sách yêu thích.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/books?category=${category.id}`}
                  className="group"
                >
                  <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
                    {/* Category Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={categoryImages[category.id] || categoryImages["1"]}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {category.name}
                        </h3>
                        <p className="text-white/80 text-sm">
                          {getCategoryBookCount(category.id)} cuốn sách
                        </p>
                      </div>
                    </div>

                    {/* Category Books Preview */}
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {category.description || "Khám phá những cuốn sách hay nhất trong danh mục này"}
                      </p>
                      
                      {/* Book Thumbnails */}
                      <div className="flex items-center gap-2">
                        {getCategoryBooks(category.id).map((book) => (
                          <div
                            key={book.id}
                            className="relative w-12 h-16 rounded overflow-hidden border border-border"
                          >
                            <Image
                              src={book.coverImage}
                              alt={book.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {getCategoryBookCount(category.id) > 4 && (
                          <div className="w-12 h-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            +{getCategoryBookCount(category.id) - 4}
                          </div>
                        )}
                      </div>

                      {/* View More Link */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-primary group-hover:underline">
                          Xem tất cả
                        </span>
                        <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{books.length}+</div>
                <div className="text-sm text-muted-foreground">Đầu sách</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Thể loại</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Tác giả</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Khách hàng</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
