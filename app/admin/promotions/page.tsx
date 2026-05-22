"use client"

import { useEffect, useState } from "react"
import { promotionsApi, type Promotion } from "@/lib/api"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

const emptyForm = {
  title: "",
  description: "",
  code: "",
  discountType: "percent" as "percent" | "fixed",
  discountValue: 10,
  minOrder: 0,
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  isActive: true,
  imageUrl: "",
}

export default function AdminPromotionsPage() {
  const [list, setList] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [form, setForm] = useState(emptyForm)

  const load = () => {
    setLoading(true)
    promotionsApi
      .getAll()
      .then(setList)
      .catch(() => toast.error("Khong tai duoc khuyen mai"))
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

  const openEdit = (p: Promotion) => {
    setEditing(p)
    setForm({
      title: p.title,
      description: p.description,
      code: p.code || "",
      discountType: p.discountType,
      discountValue: p.discountValue,
      minOrder: p.minOrder || 0,
      startDate: p.startDate,
      endDate: p.endDate,
      isActive: p.isActive,
      imageUrl: p.imageUrl || "",
    })
    setOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        code: form.code || undefined,
        minOrder: form.minOrder || undefined,
        imageUrl: form.imageUrl || undefined,
      }
      if (editing) {
        await promotionsApi.update(editing.id, payload)
        toast.success("Cap nhat thanh cong")
      } else {
        await promotionsApi.create(payload)
        toast.success("Tao khuyen mai thanh cong")
      }
      setOpen(false)
      load()
    } catch {
      toast.error("Luu that bai")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Xoa khuyen mai nay?")) return
    try {
      await promotionsApi.remove(id)
      toast.success("Da xoa")
      load()
    } catch {
      toast.error("Xoa that bai")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quan ly khuyen mai</h1>
          <p className="text-muted-foreground">Hien thi tai trang /sale cho khach hang</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Them khuyen mai
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Sua" : "Them"} khuyen mai</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Tieu de</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Mo ta</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ma (tuy chon)</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loai giam</Label>
                  <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v as "percent" | "fixed" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Phan tram</SelectItem>
                      <SelectItem value="fixed">So tien</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Gia tri</Label>
                  <Input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tu ngay</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Den ngay</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} />
                <Label>Dang hoat dong</Label>
              </div>
              <Button className="w-full" onClick={handleSave}>Luu</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Dang tai...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between">
                  {p.title}
                  <span className={`text-xs px-2 py-1 rounded ${p.isActive ? "bg-green-100 text-green-800" : "bg-gray-100"}`}>
                    {p.isActive ? "Active" : "Off"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <p className="text-sm font-medium">
                  {p.discountType === "percent" ? `-${p.discountValue}%` : `-${p.discountValue.toLocaleString("vi-VN")}d`}
                  {p.code && ` · Ma: ${p.code}`}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
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
