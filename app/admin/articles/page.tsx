"use client"

import { useEffect, useState } from "react"
import { articlesApi, type Article } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "<p>Nội dung bài viết...</p>",
  coverImage: "",
  authorName: "BookStore",
  isPublished: false,
}

export default function AdminArticlesPage() {
  const [list, setList] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [form, setForm] = useState(emptyForm)

  const load = () => {
    setLoading(true)
    articlesApi
      .getAll()
      .then(setList)
      .catch(() => toast.error("Không tải được bài viết"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (a: Article) => {
    setEditing(a)
    setForm({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: a.content,
      coverImage: a.coverImage || "",
      authorName: a.authorName,
      isPublished: a.isPublished,
    })
    setOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        coverImage: form.coverImage || undefined,
        slug: form.slug || undefined,
      }
      if (editing) {
        await articlesApi.update(editing.id, payload)
        toast.success("Cập nhật thành công")
      } else {
        await articlesApi.create(payload)
        toast.success("Tạo bài viết thành công")
      }
      setOpen(false)
      load()
    } catch {
      toast.error("Lưu thất bại")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bài viết này?")) return
    try {
      await articlesApi.remove(id)
      toast.success("Đã xóa")
      load()
    } catch {
      toast.error("Xóa thất bại (chỉ admin)")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
          <p className="text-muted-foreground">Khách xem tại /articles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Viết bài mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Sửa" : "Thêm"} bài viết</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Tiêu đề</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input value={form.slug} placeholder="tự động nếu để trống" onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tóm tắt</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nội dung (HTML)</Label>
                <Textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ảnh bìa URL</Label>
                <Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tác giả</Label>
                <Input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isPublished} onCheckedChange={(c) => setForm({ ...form, isPublished: c })} />
                <Label>Xuất bản</Label>
              </div>
              <Button className="w-full" onClick={handleSave}>Lưu</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : (
        <div className="space-y-4">
          {list.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{a.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">/{a.slug}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${a.isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {a.isPublished ? "Đã xuất bản" : "Nháp"}
                </span>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground line-clamp-1 flex-1">{a.excerpt}</p>
                <div className="flex gap-2 ml-4">
                  {a.isPublished && (
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/articles/${a.slug}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}