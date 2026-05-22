'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BookCard } from '@/components/book-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { Book, Category } from '@/lib/data'
import { booksApi, categoriesApi } from '@/lib/api'

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'bestseller', label: 'Bán chạy nhất' },
]

const priceRanges = [
  { value: '0-50000', label: 'Dưới 50.000đ' },
  { value: '50000-100000', label: '50.000đ - 100.000đ' },
  { value: '100000-200000', label: '100.000đ - 200.000đ' },
  { value: '200000-500000', label: '200.000đ - 500.000đ' },
  { value: '500000-99999999', label: 'Trên 500.000đ' },
]

function FilterSidebar({
  selectedCategories,
  setSelectedCategories,
  selectedPriceRanges,
  setSelectedPriceRanges,
  selectedAuthors,
  setSelectedAuthors,
  selectedPublishers,
  setSelectedPublishers,
  authors,
  publishers,
  categories,
  onReset,
}: {
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  selectedPriceRanges: string[]
  setSelectedPriceRanges: (ranges: string[]) => void
  selectedAuthors: string[]
  setSelectedAuthors: (authors: string[]) => void
  selectedPublishers: string[]
  setSelectedPublishers: (publishers: string[]) => void
  authors: string[]
  publishers: string[]
  categories: Category[]
  onReset: () => void
}) {
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [authorOpen, setAuthorOpen] = useState(true)
  const [publisherOpen, setPublisherOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)

  const toggleCategory = (slug: string) => {
    setSelectedCategories(
      selectedCategories.includes(slug)
        ? selectedCategories.filter((c) => c !== slug)
        : [...selectedCategories, slug]
    )
  }

  const togglePriceRange = (value: string) => {
    setSelectedPriceRanges(
      selectedPriceRanges.includes(value)
        ? selectedPriceRanges.filter((p) => p !== value)
        : [...selectedPriceRanges, value]
    )
  }

  const toggleAuthor = (name: string) => {
    setSelectedAuthors(
      selectedAuthors.includes(name)
        ? selectedAuthors.filter((a) => a !== name)
        : [...selectedAuthors, name],
    )
  }

  const togglePublisher = (name: string) => {
    setSelectedPublishers(
      selectedPublishers.includes(name)
        ? selectedPublishers.filter((p) => p !== name)
        : [...selectedPublishers, name],
    )
  }

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedAuthors.length > 0 ||
    selectedPublishers.length > 0

  return (
    <div className="space-y-6">
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="w-full justify-start text-muted-foreground">
          <X className="h-4 w-4 mr-2" />
          Xóa bộ lọc
        </Button>
      )}

      {/* Categories */}
      <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          Thể loại
          <ChevronDown className={`h-4 w-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => toggleCategory(category.slug)}
              />
              <Label
                htmlFor={`cat-${category.id}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {category.name}
                <span className="text-muted-foreground ml-1">({category.bookCount})</span>
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={authorOpen} onOpenChange={setAuthorOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          Tac gia
          <ChevronDown className={`h-4 w-4 transition-transform ${authorOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2 max-h-48 overflow-y-auto">
          {authors.map((author) => (
            <div key={author} className="flex items-center gap-2">
              <Checkbox
                id={`author-${author}`}
                checked={selectedAuthors.includes(author)}
                onCheckedChange={() => toggleAuthor(author)}
              />
              <Label htmlFor={`author-${author}`} className="text-sm font-normal cursor-pointer">
                {author}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={publisherOpen} onOpenChange={setPublisherOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          Nha xuat ban
          <ChevronDown className={`h-4 w-4 transition-transform ${publisherOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2 max-h-48 overflow-y-auto">
          {publishers.map((publisher) => (
            <div key={publisher} className="flex items-center gap-2">
              <Checkbox
                id={`pub-${publisher}`}
                checked={selectedPublishers.includes(publisher)}
                onCheckedChange={() => togglePublisher(publisher)}
              />
              <Label htmlFor={`pub-${publisher}`} className="text-sm font-normal cursor-pointer">
                {publisher}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          Giá
          <ChevronDown className={`h-4 w-4 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {priceRanges.map((range) => (
            <div key={range.value} className="flex items-center gap-2">
              <Checkbox
                id={`price-${range.value}`}
                checked={selectedPriceRanges.includes(range.value)}
                onCheckedChange={() => togglePriceRange(range.value)}
              />
              <Label
                htmlFor={`price-${range.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {range.label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function BooksPageContent() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialFilter = searchParams.get('filter') || ''

  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [sortBy, setSortBy] = useState('newest')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  )
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([])
  const [authors, setAuthors] = useState<string[]>([])
  const [publishers, setPublishers] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    Promise.all([booksApi.getFiltersMeta(), categoriesApi.getAll()]).then(
      ([meta, cats]) => {
        setAuthors(meta.authors)
        setPublishers(meta.publishers)
        setCategories(cats)
      },
    )
  }, [])

  useEffect(() => {
    setLoading(true)
    const q = searchQuery || initialSearch
    let minPrice: number | undefined
    let maxPrice: number | undefined
    if (selectedPriceRanges.length === 1) {
      const [min, max] = selectedPriceRanges[0].split('-').map(Number)
      minPrice = min
      maxPrice = max
    }

    booksApi
      .getAll({
        search: q || undefined,
        category: selectedCategories[0] || undefined,
        author: selectedAuthors[0] || undefined,
        publisher: selectedPublishers[0] || undefined,
        filter: (initialFilter as 'featured' | 'new' | 'bestseller') || undefined,
        sortBy,
        minPrice,
        maxPrice,
      })
      .then((data) => {
        let result = data
        if (selectedCategories.length > 1) {
          result = result.filter((book) => {
            const slug = book.category.toLowerCase().replace(/ /g, '-')
            return selectedCategories.some(
              (cat) => slug.includes(cat) || cat.includes(slug),
            )
          })
        }
        if (selectedAuthors.length > 1) {
          result = result.filter((b) => selectedAuthors.includes(b.author))
        }
        if (selectedPublishers.length > 1) {
          result = result.filter((b) => selectedPublishers.includes(b.publisher))
        }
        if (selectedPriceRanges.length > 1) {
          result = result.filter((book) =>
            selectedPriceRanges.some((range) => {
              const [min, max] = range.split('-').map(Number)
              return book.price >= min && book.price <= max
            }),
          )
        }
        setBooks(result)
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))
  }, [
    searchQuery,
    initialSearch,
    initialFilter,
    selectedCategories,
    selectedAuthors,
    selectedPublishers,
    selectedPriceRanges,
    sortBy,
  ])

  const filteredBooks = books

  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedPriceRanges([])
    setSelectedAuthors([])
    setSelectedPublishers([])
    setSearchQuery('')
  }

  const filterCount =
    selectedCategories.length +
    selectedPriceRanges.length +
    selectedAuthors.length +
    selectedPublishers.length

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl lg:text-4xl font-semibold">
              {initialFilter === 'featured'
                ? 'Sách nổi bật'
                : initialFilter === 'new'
                ? 'Sách mới'
                : initialFilter === 'bestseller'
                ? 'Sách bán chạy'
                : 'Tất cả sách'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {filteredBooks.length} sản phẩm
            </p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h2 className="font-semibold mb-4">Bộ lọc</h2>
                <FilterSidebar
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedPriceRanges={selectedPriceRanges}
                  setSelectedPriceRanges={setSelectedPriceRanges}
                  selectedAuthors={selectedAuthors}
                  setSelectedAuthors={setSelectedAuthors}
                  selectedPublishers={selectedPublishers}
                  setSelectedPublishers={setSelectedPublishers}
                  authors={authors}
                  publishers={publishers}
                  categories={categories}
                  onReset={resetFilters}
                />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Input
                    type="text"
                    placeholder="Tìm kiếm trong kết quả..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex gap-2">
                  {/* Mobile filter */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Bộ lọc
                        {filterCount > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                            {filterCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Bộ lọc</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterSidebar
                          selectedCategories={selectedCategories}
                          setSelectedCategories={setSelectedCategories}
                          selectedPriceRanges={selectedPriceRanges}
                          setSelectedPriceRanges={setSelectedPriceRanges}
                          selectedAuthors={selectedAuthors}
                          setSelectedAuthors={setSelectedAuthors}
                          selectedPublishers={selectedPublishers}
                          setSelectedPublishers={setSelectedPublishers}
                          authors={authors}
                          publishers={publishers}
                          onReset={resetFilters}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Books grid */}
              {loading ? (
                <div className="text-center py-16 text-muted-foreground">
                  Dang tai sach...
                </div>
              ) : filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">
                    Không tìm thấy sách phù hợp với bộ lọc của bạn.
                  </p>
                  <Button variant="outline" onClick={resetFilters} className="mt-4">
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function BooksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Đang tải...</p>
          </main>
          <Footer />
        </div>
      }
    >
      <BooksPageContent />
    </Suspense>
  )
}