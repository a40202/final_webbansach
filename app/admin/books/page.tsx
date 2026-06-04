"use client"

import { memo, useCallback, useEffect, useState } from "react"
import { booksApi, categoriesApi, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { Book, Category } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search, Filter } from "lucide-react"
import { toast } from "sonner"

type BookFormData = {
  title: string
  author: string
  description: string
  price: string
  originalPrice: string
  categoryId: string
  publisher: string
  publishYear: string
  pages: string
  stock: string
  coverImage: string
  isbn: string
}

const emptyBookForm: BookFormData = {
  title: "",
  author: "",
  description: "",
  price: "",
  originalPrice: "",
  categoryId: "",
  publisher: "",
  publishYear: "",
  pages: "",
  stock: "",
  coverImage: "",
  isbn: "",
}

function bookToFormData(book: Book): BookFormData {
  return {
    title: book.title,
    author: book.author,
    description: book.description,
    price: book.price.toString(),
    originalPrice: book.originalPrice?.toString() || "",
    categoryId: book.categoryId || "",
    publisher: book.publisher,
    publishYear: book.publishYear.toString(),
    pages: book.pages.toString(),
    stock: book.stock.toString(),
    coverImage: book.coverImage,
    isbn: book.isbn,
  }
}

function buildPayload(formData: BookFormData) {
  return {
    title: formData.title,
    author: formData.author,
    description: formData.description,
    price: parseInt(formData.price),
    originalPrice: formData.originalPrice
      ? parseInt(formData.originalPrice)
      : undefined,
    categoryId: formData.categoryId,
    publisher: formData.publisher,
    publishYear: formData.publishYear
      ? parseInt(formData.publishYear)
      : undefined,
    pages: formData.pages ? parseInt(formData.pages) : undefined,
    stock: formData.stock ? parseInt(formData.stock) : 0,
    coverImage: formData.coverImage || undefined,
    isbn: formData.isbn,
  }
}

const BookForm = memo(function BookForm({
  formData,
  onChange,
  categoryList,
  onSubmit,
  submitLabel,
  idPrefix,
}: {
  formData: BookFormData
  onChange: (patch: Partial<BookFormData>) => void
  categoryList: Category[]
  onSubmit: () => void
  submitLabel: string
  idPrefix: string
}) {
  const fieldId = (name: string) => `${idPrefix}-${name}`

  return (
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
      <div className="grid gap-2">
        <Label htmlFor={fieldId("title")}>Tên sách *</Label>
        <Input
          id={fieldId("title")}
          value={formData.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Nhập tên sách"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={fieldId("author")}>Tác giả *</Label>
        <Input
          id={fieldId("author")}
          value={formData.author}
          onChange={(e) => onChange({ author: e.target.value })}
          placeholder="Nhập tên tác giả"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={fieldId("isbn")}>ISBN *</Label>
        <Input
          id={fieldId("isbn")}
          value={formData.isbn}
          onChange={(e) => onChange({ isbn: e.target.value })}
          placeholder="Nhập mã ISBN"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={fieldId("category")}>Thể loại *</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => onChange({ categoryId: value })}
        >
          <SelectTrigger id={fieldId("category")}>
            <SelectValue placeholder="Chọn thể loại" />
          </SelectTrigger>
          <SelectContent>
            {categoryList.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={fieldId("price")}>Giá bán *</Label>
          <Input
            id={fieldId("price")}
            type="number"
            value={formData.price}
            onChange={(e) => onChange({ price: e.target.value })}
            placeholder="VNĐ"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={fieldId("originalPrice")}>Giá gốc</Label>
          <Input
            id={fieldId("originalPrice")}
            type="number"
            value={formData.originalPrice}
            onChange={(e) => onChange({ originalPrice: e.target.value })}
            placeholder="VNĐ"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={fieldId("publisher")}>Nhà xuất bản</Label>
          <Input
            id={fieldId("publisher")}
            value={formData.publisher}
            onChange={(e) => onChange({ publisher: e.target.value })}
            placeholder="NXB"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={fieldId("publishYear")}>Năm xuất bản</Label>
          <Input
            id={fieldId("publishYear")}
            type="number"
            value={formData.publishYear}
            onChange={(e) => onChange({ publishYear: e.target.value })}
            placeholder="Năm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={fieldId("pages")}>Số trang</Label>
          <Input
            id={fieldId("pages")}
            type="number"
            value={formData.pages}
            onChange={(e) => onChange({ pages: e.target.value })}
            placeholder="Số trang"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={fieldId("stock")}>Số lượng tồn kho *</Label>
          <Input
            id={fieldId("stock")}
            type="number"
            value={formData.stock}
            onChange={(e) => onChange({ stock: e.target.value })}
            placeholder="Số lượng"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={fieldId("coverImage")}>URL ảnh bìa</Label>
        <Input
          id={fieldId("coverImage")}
          value={formData.coverImage}
          onChange={(e) => onChange({ coverImage: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={fieldId("description")}>Mô tả</Label>
        <Textarea
          id={fieldId("description")}
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Nhập mô tả sách"
          rows={4}
        />
      </div>
      <Button type="button" onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  )
})

export default function AdminBooksPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [bookList, setBookList] = useState<Book[]>([])
  const [categoryList, setCategoryList] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  const [addFormData, setAddFormData] = useState<BookFormData>(emptyBookForm)
  const [editFormData, setEditFormData] = useState<BookFormData>(emptyBookForm)

  const updateAddForm = useCallback((patch: Partial<BookFormData>) => {
    setAddFormData((prev) => ({ ...prev, ...patch }))
  }, [])

  const updateEditForm = useCallback((patch: Partial<BookFormData>) => {
    setEditFormData((prev) => ({ ...prev, ...patch }))
  }, [])

  const load = () => {
    setLoading(true)
    Promise.all([booksApi.getAll(), categoriesApi.getAll()])
      .then(([books, categories]) => {
        setBookList(books)
        setCategoryList(categories)
      })
      .catch(() => toast.error("Không tải được danh sách sách"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filteredBooks = bookList.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" ||
      book.categoryId === selectedCategory ||
      book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const resetAddForm = () => {
    setAddFormData(emptyBookForm)
  }

  const handleAddDialogChange = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (!open) resetAddForm()
  }

  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open)
    if (!open) {
      setSelectedBook(null)
      setEditFormData(emptyBookForm)
    }
  }

  const handleAdd = async () => {
    if (
      !addFormData.title ||
      !addFormData.author ||
      !addFormData.categoryId ||
      !addFormData.isbn ||
      !addFormData.price
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }
    try {
      await booksApi.create(buildPayload(addFormData))
      toast.success("Thêm sách thành công")
      setIsAddDialogOpen(false)
      resetAddForm()
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể thêm sách")
    }
  }

  const handleEdit = async () => {
    if (!selectedBook) return
    try {
      await booksApi.update(selectedBook.id, buildPayload(editFormData))
      toast.success("Cập nhật sách thành công")
      setIsEditDialogOpen(false)
      setSelectedBook(null)
      setEditFormData(emptyBookForm)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể cập nhật sách")
    }
  }

  const handleDelete = async (bookId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sách này?")) return
    try {
      await booksApi.remove(bookId)
      toast.success("Xóa sách thành công")
      setBookList((prev) => prev.filter((b) => b.id !== bookId))
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Không thể xóa sách"
      toast.error(msg)
    }
  }

  const openEditDialog = (book: Book) => {
    setSelectedBook(book)
    setEditFormData(bookToFormData(book))
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sách</h1>
          <p className="text-muted-foreground">Quản lý danh sách sách trong hệ thống</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogChange}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetAddForm()
                setIsAddDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm sách mới
            </Button>
          </DialogTrigger>
          {isAddDialogOpen && (
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Thêm sách mới</DialogTitle>
              </DialogHeader>
              <BookForm
                idPrefix="add"
                formData={addFormData}
                onChange={updateAddForm}
                categoryList={categoryList}
                onSubmit={handleAdd}
                submitLabel="Thêm sách"
              />
            </DialogContent>
          )}
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên sách, tác giả, ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Thể loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thể loại</SelectItem>
                {categoryList.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Ảnh</TableHead>
                    <TableHead>Tên sách</TableHead>
                    <TableHead className="hidden md:table-cell">Tác giả</TableHead>
                    <TableHead className="hidden lg:table-cell">Thể loại</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Tồn kho</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((book) => {
                    const category = categoryList.find((c) => c.id === book.categoryId)
                    const categoryName = category?.name || book.category
                    return (
                      <TableRow key={book.id}>
                        <TableCell>
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">{book.title}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{book.author}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{book.author}</TableCell>
                        <TableCell className="hidden lg:table-cell">{categoryName}</TableCell>
                        <TableCell className="text-right">
                          <div>
                            <p className="font-medium">{book.price.toLocaleString("vi-VN")}đ</p>
                            {book.originalPrice && (
                              <p className="text-xs text-muted-foreground line-through">
                                {book.originalPrice.toLocaleString("vi-VN")}đ
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              book.stock < 10
                                ? "bg-red-100 text-red-800"
                                : book.stock < 50
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {book.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(book)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(book.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {!loading && filteredBooks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Không tìm thấy sách nào
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        {isEditDialogOpen && selectedBook && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa sách</DialogTitle>
            </DialogHeader>
            <BookForm
              key={selectedBook.id}
              idPrefix="edit"
              formData={editFormData}
              onChange={updateEditForm}
              categoryList={categoryList}
              onSubmit={handleEdit}
              submitLabel="Lưu thay đổi"
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
