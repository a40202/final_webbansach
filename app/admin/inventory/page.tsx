"use client"

import { useState } from "react"
import { books, categories, inventoryLogs } from "@/lib/data"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  Plus, 
  Minus, 
  Search, 
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  History
} from "lucide-react"
import type { Book, InventoryLog } from "@/lib/data"

export default function AdminInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [bookList, setBookList] = useState(books)
  const [logs, setLogs] = useState(inventoryLogs)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [quantity, setQuantity] = useState("")
  const [note, setNote] = useState("")

  const filteredBooks = bookList.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStock = true
    if (stockFilter === "low") matchesStock = book.stock < 10
    else if (stockFilter === "medium") matchesStock = book.stock >= 10 && book.stock < 50
    else if (stockFilter === "high") matchesStock = book.stock >= 50
    else if (stockFilter === "out") matchesStock = book.stock === 0

    return matchesSearch && matchesStock
  })

  const lowStockBooks = bookList.filter((b) => b.stock < 10 && b.stock > 0)
  const outOfStockBooks = bookList.filter((b) => b.stock === 0)
  const totalStock = bookList.reduce((sum, b) => sum + b.stock, 0)

  const handleImport = () => {
    if (!selectedBook || !quantity) return
    
    const qty = parseInt(quantity)
    const updatedBooks = bookList.map((book) =>
      book.id === selectedBook.id
        ? { ...book, stock: book.stock + qty }
        : book
    )
    setBookList(updatedBooks)

    const newLog: InventoryLog = {
      id: `log-${Date.now()}`,
      bookId: selectedBook.id,
      type: "import",
      quantity: qty,
      note: note || "Nhập kho",
      createdAt: new Date().toISOString(),
      createdBy: "admin",
    }
    setLogs([newLog, ...logs])

    setIsImportDialogOpen(false)
    setSelectedBook(null)
    setQuantity("")
    setNote("")
  }

  const handleExport = () => {
    if (!selectedBook || !quantity) return
    
    const qty = parseInt(quantity)
    if (qty > selectedBook.stock) {
      alert("Số lượng xuất vượt quá tồn kho!")
      return
    }

    const updatedBooks = bookList.map((book) =>
      book.id === selectedBook.id
        ? { ...book, stock: book.stock - qty }
        : book
    )
    setBookList(updatedBooks)

    const newLog: InventoryLog = {
      id: `log-${Date.now()}`,
      bookId: selectedBook.id,
      type: "export",
      quantity: qty,
      note: note || "Xuất kho",
      createdAt: new Date().toISOString(),
      createdBy: "admin",
    }
    setLogs([newLog, ...logs])

    setIsExportDialogOpen(false)
    setSelectedBook(null)
    setQuantity("")
    setNote("")
  }

  const openImportDialog = (book: Book) => {
    setSelectedBook(book)
    setQuantity("")
    setNote("")
    setIsImportDialogOpen(true)
  }

  const openExportDialog = (book: Book) => {
    setSelectedBook(book)
    setQuantity("")
    setNote("")
    setIsExportDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý kho</h1>
        <p className="text-muted-foreground">Theo dõi và quản lý tồn kho sách</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-50">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng tồn kho</p>
              <p className="text-2xl font-bold">{totalStock.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-50">
              <ArrowUpCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng đầu sách</p>
              <p className="text-2xl font-bold">{bookList.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={lowStockBooks.length > 0 ? "border-yellow-200" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-full ${lowStockBooks.length > 0 ? "bg-yellow-50" : "bg-gray-50"}`}>
              <AlertTriangle className={`h-5 w-5 ${lowStockBooks.length > 0 ? "text-yellow-600" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sắp hết hàng</p>
              <p className="text-2xl font-bold">{lowStockBooks.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={outOfStockBooks.length > 0 ? "border-red-200" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-full ${outOfStockBooks.length > 0 ? "bg-red-50" : "bg-gray-50"}`}>
              <Minus className={`h-5 w-5 ${outOfStockBooks.length > 0 ? "text-red-600" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hết hàng</p>
              <p className="text-2xl font-bold">{outOfStockBooks.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Tồn kho</TabsTrigger>
          <TabsTrigger value="history">Lịch sử nhập/xuất</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
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
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Lọc theo tồn kho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="out">Hết hàng (0)</SelectItem>
                    <SelectItem value="low">Sắp hết (dưới 10)</SelectItem>
                    <SelectItem value="medium">Trung bình (10-50)</SelectItem>
                    <SelectItem value="high">Đủ hàng (trên 50)</SelectItem>
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
                      <TableHead className="hidden md:table-cell">ISBN</TableHead>
                      <TableHead className="hidden lg:table-cell">Thể loại</TableHead>
                      <TableHead className="text-center">Tồn kho</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.map((book) => {
                      const category = categories.find((c) => c.id === book.categoryId)
                      const categoryName = category?.name || book.category
                      let statusColor = "bg-green-100 text-green-800"
                      let statusText = "Đủ hàng"
                      if (book.stock === 0) {
                        statusColor = "bg-red-100 text-red-800"
                        statusText = "Hết hàng"
                      } else if (book.stock < 10) {
                        statusColor = "bg-yellow-100 text-yellow-800"
                        statusText = "Sắp hết"
                      } else if (book.stock < 50) {
                        statusColor = "bg-blue-100 text-blue-800"
                        statusText = "Trung bình"
                      }

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
                              <p className="text-xs text-muted-foreground">{book.author}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell font-mono text-sm">
                            {book.isbn}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">{categoryName}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-lg font-bold">{book.stock}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                              {statusText}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => openImportDialog(book)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Nhập
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                onClick={() => openExportDialog(book)}
                                disabled={book.stock === 0}
                              >
                                <Minus className="h-4 w-4 mr-1" />
                                Xuất
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
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Lịch sử nhập/xuất kho
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Sách</TableHead>
                      <TableHead className="text-center">Loại</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="hidden md:table-cell">Ghi chú</TableHead>
                      <TableHead className="hidden sm:table-cell">Người thực hiện</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const book = bookList.find((b) => b.id === log.bookId)
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {new Date(log.createdAt).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium line-clamp-1">{book?.title}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            {log.type === "import" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <ArrowUpCircle className="h-3 w-3" />
                                Nhập
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <ArrowDownCircle className="h-3 w-3" />
                                Xuất
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {log.type === "import" ? "+" : "-"}{log.quantity}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {log.note}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {log.createdBy}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              {logs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Chưa có lịch sử nhập/xuất
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập kho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedBook && (
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{selectedBook.title}</p>
                  <p className="text-sm text-muted-foreground">Tồn kho hiện tại: {selectedBook.stock}</p>
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="import-quantity">Số lượng nhập *</Label>
              <Input
                id="import-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Nhập số lượng"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="import-note">Ghi chú</Label>
              <Textarea
                id="import-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú (tùy chọn)"
              />
            </div>
            <Button onClick={handleImport} className="w-full" disabled={!quantity}>
              <Plus className="h-4 w-4 mr-2" />
              Xác nhận nhập kho
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xuất kho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedBook && (
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{selectedBook.title}</p>
                  <p className="text-sm text-muted-foreground">Tồn kho hiện tại: {selectedBook.stock}</p>
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="export-quantity">Số lượng xuất *</Label>
              <Input
                id="export-quantity"
                type="number"
                min="1"
                max={selectedBook?.stock || 0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Nhập số lượng"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="export-note">Ghi chú</Label>
              <Textarea
                id="export-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Lý do xuất kho"
              />
            </div>
            <Button onClick={handleExport} className="w-full" disabled={!quantity}>
              <Minus className="h-4 w-4 mr-2" />
              Xác nhận xuất kho
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
