"use client"

import { useEffect, useState } from "react"
import { categoriesApi } from "@/lib/api"
import type { Category } from "@/lib/data"
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
import { Plus, Pencil, Trash2, Search, Tag } from "lucide-react"
import { toast } from "sonner"

export default function AdminCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryList, setCategoryList] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  })

  const load = () => {
    setLoading(true)
    categoriesApi
      .getAll()
      .then(setCategoryList)
      .catch(() => toast.error("Không tải được danh mục"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filteredCategories = categoryList.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase()),
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

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục")
      return
    }
    try {
      await categoriesApi.create({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
      })
      toast.success("Thêm danh mục thành công")
      setIsAddDialogOpen(false)
      resetForm()
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Thêm thất bại")
    }
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

  const handleEdit = async () => {
    if (!selectedCategory || !formData.name.trim()) return
    try {
      await categoriesApi.update(selectedCategory.id, formData)
      toast.success("Cập nhật thành công")
      setIsEditDialogOpen(false)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cập nhật thất bại")
    }
  }

  const openDelete = (cat: Category) => {
    setSelectedCategory(cat)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedCategory) return
    try {
      await categoriesApi.remove(selectedCategory.id)
      toast.success("Đã xóa danh mục")
      setIsDeleteDialogOpen(false)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xóa thất bại")
    }
  }

  const formFields = (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label>Tên danh mục</Label>
        <Input
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Slug</Label>
        <Input
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Mô tả</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
          <p className="text-muted-foreground">Đồng bộ từ PostgreSQL</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsAddDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm danh mục mới</DialogTitle>
            </DialogHeader>
            {formFields}
            <Button onClick={handleAdd}>Lưu</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={load}>
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground">Đang tải...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Số sách</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-mono">{cat.id}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        {cat.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="text-center">{cat.bookCount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDelete(cat)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa danh mục</DialogTitle>
          </DialogHeader>
          {formFields}
          <Button onClick={handleEdit}>Cập nhật</Button>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa &quot;{selectedCategory?.name}&quot;?
              {selectedCategory && selectedCategory.bookCount > 0 && (
                <span className="block mt-2 text-destructive">
                  Danh mục đang có {selectedCategory.bookCount} sách.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}