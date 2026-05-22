'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FileText, Calendar, User } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { articlesApi, type Article } from '@/lib/api'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    articlesApi
      .getPublished()
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-secondary py-12">
          <div className="container mx-auto px-4 text-center">
            <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-serif text-3xl lg:text-4xl font-semibold">Bai viet</h1>
            <p className="text-muted-foreground mt-2">Tin tuc, review sach va meo doc sach hay</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          {loading ? (
            <p className="text-center text-muted-foreground">Dang tai bai viet...</p>
          ) : articles.length === 0 ? (
            <p className="text-center text-muted-foreground">Chua co bai viet</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                    {article.coverImage && (
                      <div className="relative h-48">
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-5 space-y-2">
                      <h2 className="font-semibold text-lg line-clamp-2">{article.title}</h2>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {article.authorName}
                        </span>
                        {article.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {article.publishedAt}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
