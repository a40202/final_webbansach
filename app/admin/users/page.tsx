"use client"

import { useEffect, useState } from "react"
import { usersApi, type PublicUser } from "@/lib/api"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Search,
  Eye,
  UserCheck,
  UserX,
  Users,
  Shield,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Plus,
  Briefcase,
} from "lucide-react"
import { toast } from "sonner"

type UserRole = "customer" | "admin" | "staff"

const roleLabels: Record<UserRole, string> = {
  customer: "Khách hàng",
  admin: "Quản trị viên",
  staff: "Nhân viên",
}

const roleColors: Record<UserRole, string> = {
  customer: "bg-blue-100 text-blue-800",
  admin: "bg-purple-100 text-purple-800",
  staff: "bg-teal-100 text-teal-800",
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [userList, setUserList] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: "",
    role: "customer" as "customer" | "staff",
  })

  const load = () => {
    setLoading(true)
    usersApi
      .getAll()
      .then(setUserList)
      .catch(() => toast.error("Không tải được danh sách người dùng"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filteredUsers = userList.filter((user) => {
    const name = user.name || user.fullName
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  const customerCount = userList.filter((u) => u.role === "customer").length
  const adminCount = userList.filter((u) => u.role === "admin").length
  const staffCount = userList.filter((u) => u.role === "staff").length
  const inactiveCount = userList.filter((u) => !u.isActive).length

  const toggleUserStatus = async (userId: string, currentActive: boolean) => {
    try {
      const updated = await usersApi.updateActive(userId, !currentActive)
      setUserList(userList.map((u) => (u.id === userId ? updated : u)))
      if (selectedUser?.id === userId) setSelectedUser(updated)
      toast.success(updated.isActive ? "Đã kích hoạt tài khoản" : "Đã vô hiệu hóa tài khoản")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể cập nhật trạng thái")
    }
  }

  const changeUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const updated = await usersApi.updateRole(userId, newRole)
      setUserList(userList.map((u) => (u.id === userId ? updated : u)))
      if (selectedUser?.id === userId) setSelectedUser(updated)
      toast.success("Đã cập nhật vai trò")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể cập nhật vai trò")
    }
  }

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.password || !createForm.fullName) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }
    try {
      await usersApi.create(createForm)
      toast.success("Tạo tài khoản thành công")
      setIsCreateDialogOpen(false)
      setCreateForm({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        address: "",
        role: "customer",
      })
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể tạo tài khoản")
    }
  }

  const openDetailDialog = (user: PublicUser) => {
    setSelectedUser(user)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo tài khoản
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo tài khoản mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label>Vai trò *</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(v) =>
                    setCreateForm({ ...createForm, role: v as "customer" | "staff" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Khách hàng</SelectItem>
                    <SelectItem value="staff">Nhân viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-fullName">Họ và tên *</Label>
                <Input
                  id="create-fullName"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-password">Mật khẩu *</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Mật khẩu"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-phone">Số điện thoại</Label>
                <Input
                  id="create-phone"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="0901234567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-address">Địa chỉ</Label>
                <Input
                  id="create-address"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  placeholder="Địa chỉ"
                />
              </div>
              <Button onClick={handleCreateUser} className="w-full">
                Tạo tài khoản
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng người dùng</p>
              <p className="text-2xl font-bold">{userList.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-50">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Khách hàng</p>
              <p className="text-2xl font-bold">{customerCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-teal-50">
              <Briefcase className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nhân viên</p>
              <p className="text-2xl font-bold">{staffCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-50">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quản trị viên</p>
              <p className="text-2xl font-bold">{adminCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-50">
              <UserX className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã vô hiệu</p>
              <p className="text-2xl font-bold">{inactiveCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="customer">Khách hàng</SelectItem>
                <SelectItem value="staff">Nhân viên</SelectItem>
                <SelectItem value="admin">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Vô hiệu</SelectItem>
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
                    <TableHead>Người dùng</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Số điện thoại</TableHead>
                    <TableHead className="text-center">Vai trò</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {(user.name || user.fullName).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name || user.fullName}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">{user.phone || "-"}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}
                        >
                          {roleLabels[user.role]}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Hoạt động" : "Vô hiệu"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openDetailDialog(user)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Không tìm thấy người dùng nào
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">
                    {(selectedUser.name || selectedUser.fullName).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.name || selectedUser.fullName}</p>
                  <p className="text-sm text-muted-foreground">{roleLabels[selectedUser.role]}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedUser.email}</span>
                </div>
                {selectedUser.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.phone}</span>
                  </div>
                )}
                {selectedUser.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Tham gia: {new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="grid gap-2">
                  <Label>Vai trò</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) =>
                      changeUserRole(selectedUser.id, value as UserRole)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Khách hàng</SelectItem>
                      <SelectItem value="staff">Nhân viên</SelectItem>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Trạng thái tài khoản</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.isActive ? "Tài khoản đang hoạt động" : "Tài khoản đã bị vô hiệu"}
                    </p>
                  </div>
                  <Button
                    variant={selectedUser.isActive ? "destructive" : "default"}
                    size="sm"
                    onClick={() =>
                      toggleUserStatus(selectedUser.id, selectedUser.isActive ?? true)
                    }
                  >
                    {selectedUser.isActive ? (
                      <>
                        <UserX className="h-4 w-4 mr-1" />
                        Vô hiệu hóa
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Kích hoạt
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
