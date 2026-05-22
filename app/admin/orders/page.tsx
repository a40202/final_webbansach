"use client"

import { useState } from "react"
import { orders, users, books } from "@/lib/data"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Eye,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Filter
} from "lucide-react"
import type { Order } from "@/lib/data"

const statusOptions = [
  { value: "pending", label: "Chờ xác nhận", icon: Clock, color: "text-yellow-600 bg-yellow-50" },
  { value: "confirmed", label: "Đã xác nhận", icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
  { value: "shipping", label: "Đang giao", icon: Truck, color: "text-purple-600 bg-purple-50" },
  { value: "delivered", label: "Đã giao", icon: Package, color: "text-green-600 bg-green-50" },
  { value: "cancelled", label: "Đã hủy", icon: XCircle, color: "text-red-600 bg-red-50" },
]

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [orderList, setOrderList] = useState(orders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const filteredOrders = orderList.filter((order) => {
    const customer = users.find((u) => u.id === order.userId)
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer?.name || customer?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.phone?.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusInfo = (status: string) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0]
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrderList(
      orderList.map((order) =>
        order.id === orderId ? { ...order, status: newStatus as Order["status"] } : order
      )
    )
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus as Order["status"] })
    }
  }

  const openDetailDialog = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailDialogOpen(true)
  }

  const pendingCount = orderList.filter((o) => o.status === "pending").length
  const shippingCount = orderList.filter((o) => o.status === "shipping").length
  const deliveredCount = orderList.filter((o) => o.status === "delivered").length
  const cancelledCount = orderList.filter((o) => o.status === "cancelled").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground">Xem và cập nhật trạng thái đơn hàng</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={pendingCount > 0 ? "border-yellow-200" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-full ${pendingCount > 0 ? "bg-yellow-50" : "bg-gray-50"}`}>
              <Clock className={`h-5 w-5 ${pendingCount > 0 ? "text-yellow-600" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chờ xác nhận</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-50">
              <Truck className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang giao</p>
              <p className="text-2xl font-bold">{shippingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-50">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã giao</p>
              <p className="text-2xl font-bold">{deliveredCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-50">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã hủy</p>
              <p className="text-2xl font-bold">{cancelledCount}</p>
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
                placeholder="Tìm theo mã đơn, tên khách hàng, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
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
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead className="hidden md:table-cell">Ngày đặt</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const customer = users.find((u) => u.id === order.userId)
                  const statusInfo = getStatusInfo(order.status)
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{(customer?.name || customer?.fullName || "Khách hàng")}</p>
                          <p className="text-xs text-muted-foreground">{customer?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {order.totalAmount.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell className="text-center">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className={`w-36 h-8 text-xs ${statusInfo.color}`}>
                            <statusInfo.icon className="h-3 w-3 mr-1" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                <div className="flex items-center gap-2">
                                  <status.icon className="h-3 w-3" />
                                  {status.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailDialog(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Không tìm thấy đơn hàng nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Thông tin khách hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const customer = users.find((u) => u.id === selectedOrder.userId)
                      return (
                        <div className="space-y-1">
                          <p className="font-medium">{customer?.name || customer?.fullName}</p>
                          <p className="text-sm text-muted-foreground">{customer?.email}</p>
                          <p className="text-sm text-muted-foreground">{customer?.phone}</p>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Thông tin giao hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="font-medium">{customer?.name || customer?.fullName || "Khách hàng"}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.phone}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.shippingAddress}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Thông tin đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ngày đặt</p>
                      <p className="font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Thanh toán</p>
                      <p className="font-medium">
                        {selectedOrder.paymentMethod === "cod" ? "Tiền mặt (COD)" : "Chuyển khoản"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Trạng thái</p>
                      <p className="font-medium">{getStatusInfo(selectedOrder.status).label}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cập nhật trạng thái</p>
                      <Select
                        value={selectedOrder.status}
                        onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                      >
                        <SelectTrigger className="h-8 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sản phẩm ({selectedOrder.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className="text-center">SL</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => {
                        const book = books.find((b) => b.id === item.bookId)
                        return (
                          <TableRow key={item.bookId}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={book?.coverImage}
                                  alt={book?.title}
                                  className="w-10 h-14 object-cover rounded"
                                />
                                <div>
                                  <p className="font-medium line-clamp-1">{book?.title}</p>
                                  <p className="text-xs text-muted-foreground">{book?.author}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {item.price.toLocaleString("vi-VN")}đ
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Total */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{(selectedOrder.totalAmount - 30000).toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span>30,000đ</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{selectedOrder.totalAmount.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
