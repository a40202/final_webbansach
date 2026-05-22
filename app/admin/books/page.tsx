"use client"

import { useState } from "react"
import { books, categories } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { Book } from "@/lib/data"

export default function AdminBooksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [bookList, setBookList] = useState(books)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  const [formData, setFormData] = useState({
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
  })

  const filteredBooks = bookList.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || book.categoryId === selectedCategory || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const resetForm = () => {
    setFormData({
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
    })
  }

  const handleAdd = () => {
    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: formData.title,
      author: formData.author,
      description: formData.description,
      price: parseInt(formData.price),
      originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : undefined,
      categoryId: formData.categoryId,
      publisher: formData.publisher,
      publishYear: parseInt(formData.publishYear),
      pages: parseInt(formData.pages),
      stock: parseInt(formData.stock),
      coverImage: formData.coverImage || "/placeholder.svg?height=400&width=300",
      isbn: formData.isbn,
      rating: 0,
      reviewCount: 0,
      soldCount: 0,
      createdAt: new Date().toISOString(),
    }
    setBookList([newBook, ...bookList])
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEdit = () => {
    if (!selectedBook) return
    const updatedBooks = bookList.map((book) =>
      book.id === selectedBook.id
        ? {
            ...book,
            title: formData.title,
            author: formData.author,
            description: formData.description,
            price: parseInt(formData.price),
            originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : undefined,
            categoryId: formData.categoryId,
            publisher: formData.publisher,
            publishYear: parseInt(formData.publishYear),
            pages: parseInt(formData.pages),
            stock: parseInt(formData.stock),
            coverImage: formData.coverImage,
            isbn: formData.isbn,
          }
        : book
    )
    setBookList(updatedBooks)
    setIsEditDialogOpen(false)
    setSelectedBook(null)
    resetForm()
  }

  const handleDelete = (bookId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sách này?")) {
      setBookList(bookList.filter((book) => book.id !== bookId))
    }
  }

  const openEditDialog = (book: Book) => {
    setSelectedBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price.toString(),
      originalPrice: book.originalPrice?.toString() || "",
      categoryId: book.categoryId,
      publisher: book.publisher,
      publishYear: book.publishYear.toString(),
      pages: book.pages.toString(),
      stock: book.stock.toString(),
      coverImage: book.coverImage,
      isbn: book.isbn,
    })
    setIsEditDialogOpen(true)
  }

  const BookForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
      <div className="grid gap-2">
        <Label htmlFor="title">Tên sách *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Nhập tên sách"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="author">Tác giả *</Label>
        <Input
          id="author"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          placeholder="Nhập tên tác giả"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="isbn">ISBN *</Label>
        <Input
          id="isbn"
          value={formData.isbn}
          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          placeholder="Nhập mã ISBN"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category">Thể loại *</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn thể loại" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Giá bán *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="VNĐ"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="originalPrice">Giá gốc</Label>
          <Input
            id="originalPrice"
            type="number"
            value={formData.originalPrice}
            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
            placeholder="VNĐ"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="publisher">Nhà xuất bản</Label>
          <Input
            id="publisher"
            value={formData.publisher}
            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
            placeholder="NXB"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="publishYear">Năm xuất bản</Label>
          <Input
            id="publishYear"
            type="number"
            value={formData.publishYear}
            onChange={(e) => setFormData({ ...formData, publishYear: e.target.value })}
            placeholder="Năm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="pages">Số trang</Label>
          <Input
            id="pages"
            type="number"
            value={formData.pages}
            onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
            placeholder="Số trang"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stock">Số lượng tồn kho *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            placeholder="Số lượng"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="coverImage">URL ảnh bìa</Label>
        <Input
          id="coverImage"
          value={formData.coverImage}
          onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Nhập mô tả sách"
          rows={4}
        />
      </div>
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sách</h1>
          <p className="text-muted-foreground">Quản lý danh sách sách trong hệ thống</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm sách mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Thêm sách mới</DialogTitle>
            </DialogHeader>
            <BookForm onSubmit={handleAdd} submitLabel="Thêm sách" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
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
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
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
                  const category = categories.find((c) => c.id === book.categoryId)
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(book.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {filteredBooks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Không tìm thấy sách nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sách</DialogTitle>
          </DialogHeader>
          <BookForm onSubmit={handleEdit} submitLabel="Lưu thay đổi" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
