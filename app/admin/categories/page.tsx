"use client"

import { useState } from "react"
import { categories as initialCategories } from "@/lib/data"
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
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Search, Tag, BookOpen } from "lucide-react"
import type { Category } from "@/lib/data"
import { toast } from "sonner"

export default function AdminCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryList, setCategoryList] = useState(initialCategories)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  })

  const filteredCategories = categoryList.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-")

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "" })
  }

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: generateSlug(name) })
  }

  const handleAdd = () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục")
      return
    }
    const isDuplicate = categoryList.some(
      (c) => c.slug === formData.slug
    )
    if (isDuplicate) {
      toast.error("Danh mục đã tồn tại")
      return
    }
    const newCategory: Category = {
      id: String(Date.now()),
      name: formData.name.trim(),
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description.trim(),
      bookCount: 0,
    }
    setCategoryList([...categoryList, newCategory])
    setIsAddDialogOpen(false)
    resetForm()
    toast.success("Đã thêm danh mục mới")
  }

  const openEdit = (cat: Category) => {
    setSelectedCategory(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
    })
    setIsEditDialogOpen(true)
  }

  const handleEdit = () => {
    if (!selectedCategory || !formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục")
      return
    }
    setCategoryList(
      categoryList.map((c) =>
        c.id === selectedCategory.id
          ? {
              ...c,
              name: formData.name.trim(),
              slug: formData.slug || generateSlug(formData.name),
              description: formData.description.trim(),
            }
          : c
      )
    )
    setIsEditDialogOpen(false)
    resetForm()
    toast.success("Đã cập nhật danh mục")
  }

  const openDelete = (cat: Category) => {
    setSelectedCategory(cat)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (!selectedCategory) return
    setCategoryList(categoryList.filter((c) => c.id !== selectedCategory.id))
    setIsDeleteDialogOpen(false)
    setSelectedCategory(null)
    toast.success("Đã xóa danh mục")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý danh mục sách</h1>
          <p className="text-muted-foreground">
            Quản lý các danh mục sách trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-50">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng danh mục</p>
              <p className="text-2xl font-bold">{categoryList.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-50">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng sách</p>
              <p className="text-2xl font-bold">
                {categoryList.reduce((s, c) => s + c.bookCount, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-50">
              <Tag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trung bình sách/danh mục</p>
              <p className="text-2xl font-bold">
                {categoryList.length > 0
                  ? Math.round(
                      categoryList.reduce((s, c) => s + c.bookCount, 0) /
                        categoryList.length
                    )
                  : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục ({filteredCategories.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead className="hidden md:table-cell">Slug</TableHead>
                  <TableHead className="hidden lg:table-cell">Mô tả</TableHead>
                  <TableHead className="text-center">Số sách</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-primary/10">
                          <Tag className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {cat.slug}
                      </code>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm max-w-xs truncate">
                      {cat.description || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-10 h-7 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {cat.bookCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(cat)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDelete(cat)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Không tìm thấy danh mục nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Tên danh mục *</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ví dụ: Văn học"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-slug">Slug (tự động)</Label>
              <Input
                id="add-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="van-hoc"
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-desc">Mô tả</Label>
              <Textarea
                id="add-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả ngắn về danh mục"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleAdd}>Thêm danh mục</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa danh mục</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên danh mục *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-desc">Mô tả</Label>
              <Textarea
                id="edit-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleEdit}>Lưu thay đổi</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa danh mục?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa danh mục{" "}
              <span className="font-semibold">"{selectedCategory?.name}"</span>?
              {selectedCategory && selectedCategory.bookCount > 0 && (
                <span className="block mt-1 text-destructive font-medium">
                  Danh mục này đang có {selectedCategory.bookCount} sách. Hãy
                  chuyển sách sang danh mục khác trước khi xóa.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa danh mục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
