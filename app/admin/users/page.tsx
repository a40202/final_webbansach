"use client"

import { useState } from "react"
import { users } from "@/lib/data"
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
  Calendar
} from "lucide-react"
import type { User } from "@/lib/data"

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [userList, setUserList] = useState(users)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const filteredUsers = userList.filter((user) => {
    const matchesSearch =
      ( user.name || user.fullName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  const customerCount = userList.filter((u) => u.role === "customer").length
  const adminCount = userList.filter((u) => u.role === "admin").length
  const activeCount = userList.filter((u) => u.isActive).length
  const inactiveCount = userList.filter((u) => !u.isActive).length

  const toggleUserStatus = (userId: string) => {
    setUserList(
      userList.map((user) =>
        user.id === userId ? { ...user, isActive: !user.isActive } : user
      )
    )
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, isActive: !selectedUser.isActive })
    }
  }

  const changeUserRole = (userId: string, newRole: "customer" | "admin") => {
    setUserList(
      userList.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    )
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, role: newRole })
    }
  }

  const openDetailDialog = (user: User) => {
    setSelectedUser(user)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <p className="text-muted-foreground">Quản lý tài khoản người dùng trong hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
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

      {/* Filters */}
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
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
                            {( user.name || user.fullName).charAt(0).toUpperCase()}
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
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role === "admin" ? "Quản trị" : "Khách hàng"}
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
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailDialog(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Không tìm thấy người dùng nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Avatar and name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">
                    {( selectedUser.name || selectedUser.fullName).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.name || selectedUser.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                  </p>
                </div>
              </div>

              {/* Contact info */}
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

              {/* Actions */}
              <div className="space-y-4 pt-4 border-t">
                <div className="grid gap-2">
                  <Label>Vai trò</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) => changeUserRole(selectedUser.id, value as "customer" | "admin")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Khách hàng</SelectItem>
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
                    onClick={() => toggleUserStatus(selectedUser.id)}
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
