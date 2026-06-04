"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { permissionsApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import {
  DEFAULT_STAFF_PERMISSIONS,
  PERMISSION_KEYS,
  PERMISSION_LABELS,
  type PermissionKey,
} from "@/lib/permissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Shield, Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"

export default function AdminPermissionsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [selected, setSelected] = useState<Set<PermissionKey>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (user?.role !== "admin") {
      router.replace("/admin")
      return
    }
    permissionsApi
      .getStaffPermissions()
      .then((res) => {
        const keys = res.permissions.filter((p): p is PermissionKey =>
          (PERMISSION_KEYS as readonly string[]).includes(p),
        )
        setSelected(new Set(keys))
      })
      .catch(() => toast.error("Không tải được cấu hình quyền"))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  const toggle = (key: PermissionKey, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const handleSave = async () => {
    if (selected.size === 0) {
      toast.error("Phải chọn ít nhất một quyền")
      return
    }
    setSaving(true)
    try {
      await permissionsApi.updateStaffPermissions([...selected])
      toast.success("Đã lưu quyền nhân viên. Nhân viên cần đăng nhập lại để áp dụng.")
    } catch {
      toast.error("Lưu thất bại")
    } finally {
      setSaving(false)
    }
  }

  const resetDefault = () => setSelected(new Set(DEFAULT_STAFF_PERMISSIONS))

  if (authLoading || user?.role !== "admin") {
    return (
      <div className="flex justify-center py-20">
        <p className="text-muted-foreground">Đang kiểm tra quyền...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          Phân quyền nhân viên
        </h1>
        <p className="text-muted-foreground mt-1">
          Chọn chức năng mà tài khoản <strong>nhân viên</strong> được phép sử dụng trong
          trang quản trị. Quản trị viên luôn có đủ quyền.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quyền truy cập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {PERMISSION_KEYS.map((key) => (
            <div key={key} className="flex items-start gap-3">
              <Checkbox
                id={`perm-${key}`}
                checked={selected.has(key)}
                onCheckedChange={(v) => toggle(key, v === true)}
              />
              <div className="grid gap-0.5">
                <Label htmlFor={`perm-${key}`} className="font-medium cursor-pointer">
                  {PERMISSION_LABELS[key]}
                </Label>
                {key === "view_revenue" && (
                  <p className="text-xs text-muted-foreground">
                    Cho phép xem doanh thu trên dashboard và báo cáo
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
        <Button type="button" variant="outline" onClick={resetDefault}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Khôi phục mặc định
        </Button>
      </div>
    </div>
  )
}
