'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { categoriesApi, booksApi } from '@/lib/api'
import type { Category, Book } from '@/lib/data'
import { BookOpen, ChevronRight } from 'lucide-react'

const categoryImages: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
  '2': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  '3': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  '4': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
  '5': 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800&q=80',
  '6': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([categoriesApi.getAll(), booksApi.getAll()])
      .then(([cats, allBooks]) => {
        setCategories(cats)
        setBooks(allBooks)
      })
      .finally(() => setLoading(false))
  }, [])

  const getCategoryBooks = (category: Category) =>
    books
      .filter(
        (b) => b.categoryId === category.id || b.category === category.name,
      )
      .slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary transition-colors">
                Trang chu
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Danh muc sach</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Danh muc sach
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Kham pha bo suu tap sach da dang, duoc phan loai theo the loai tu database.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Dang tai danh muc...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((category) => {
                  const preview = getCategoryBooks(category)
                  return (
                    <Link
                      key={category.id}
                      href={`/books?category=${category.slug}`}
                      className="group"
                    >
                      <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={categoryImages[category.id] || categoryImages['1']}
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
                              {category.bookCount} cuon sach
                            </p>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {category.description}
                          </p>
                          {preview.length > 0 && (
                            <div className="flex gap-2">
                              {preview.map((book) => (
                                <div
                                  key={book.id}
                                  className="w-10 h-14 rounded overflow-hidden border"
                                >
                                  <Image
                                    src={book.coverImage}
                                    alt={book.title}
                                    width={40}
                                    height={56}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <section className="py-8 border-t">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 justify-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {categories.length}
                </div>
                <div className="text-sm text-muted-foreground">The loai</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
