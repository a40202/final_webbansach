'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Calendar, User } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { articlesApi, type Article } from '@/lib/api'

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    articlesApi
      .getBySlug(slug)
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Dang tai...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold">Khong tim thay bai viet</h1>
            <Button asChild className="mt-4">
              <Link href="/articles">Quay lai</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <article className="container mx-auto px-4 py-8 max-w-3xl">
          <Link
            href="/articles"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Tat ca bai viet
          </Link>

          {article.coverImage && (
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-8">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <h1 className="font-serif text-3xl lg:text-4xl font-semibold">{article.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4 mb-8">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {article.authorName}
            </span>
            {article.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {article.publishedAt}
              </span>
            )}
          </div>

          <div
            className="prose prose-neutral max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </main>
      <Footer />
    </div>
  )
}
