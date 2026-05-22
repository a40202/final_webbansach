"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { books, orders, users, getInventoryStats } from "@/lib/data"
import { 
  BookOpen, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Tag,
  HeadphonesIcon
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockBooks: 0,
  })

  const [recentOrders, setRecentOrders] = useState<typeof orders>([])

  useEffect(() => {
    const inventoryStats = getInventoryStats()
    const completedOrders = orders.filter(o => o.status === "delivered")
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const pendingOrders = orders.filter(o => o.status === "pending").length
    const lowStockBooks = books.filter(b => b.stock < 10).length

    setStats({
      totalBooks: books.length,
      totalOrders: orders.length,
      totalUsers: users.filter(u => u.role === "customer").length,
      totalRevenue,
      pendingOrders,
      lowStockBooks,
    })

    setRecentOrders(orders.slice(0, 5))
  }, [])

  const statCards = [
    {
      title: "Tổng doanh thu",
      value: stats.totalRevenue.toLocaleString("vi-VN") + "đ",
      icon: DollarSign,
      change: "+12.5%",
      trend: "up",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tổng đơn hàng",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      change: "+8.2%",
      trend: "up",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng sách",
      value: stats.totalBooks.toString(),
      icon: BookOpen,
      change: "+3",
      trend: "up",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Khách hàng",
      value: stats.totalUsers.toString(),
      icon: Users,
      change: "+15.3%",
      trend: "up",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "confirmed": return "bg-blue-100 text-blue-800"
      case "shipping": return "bg-purple-100 text-purple-800"
      case "delivered": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Chờ xác nhận"
      case "confirmed": return "Đã xác nhận"
      case "shipping": return "Đang giao"
      case "delivered": return "Đã giao"
      case "cancelled": return "Đã hủy"
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan về hoạt động kinh doanh</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground">so với tháng trước</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {stats.pendingOrders > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-full bg-yellow-100">
                <ShoppingCart className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-yellow-800">
                  {stats.pendingOrders} đơn hàng đang chờ xác nhận
                </p>
                <p className="text-sm text-yellow-700">Cần xử lý sớm</p>
              </div>
              <Button variant="outline" size="sm" asChild className="border-yellow-300 hover:bg-yellow-100">
                <Link href="/admin/orders">Xem ngay</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {stats.lowStockBooks > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-800">
                  {stats.lowStockBooks} sản phẩm sắp hết hàng
                </p>
                <p className="text-sm text-red-700">Số lượng dưới 10 cuốn</p>
              </div>
              <Button variant="outline" size="sm" asChild className="border-red-300 hover:bg-red-100">
                <Link href="/admin/inventory">Kiểm tra</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent orders and top books */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const customer = users.find(u => u.id === order.userId)
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{order.id}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {customer?.name || customer?.fullName || "Khách hàng"}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium">{order.totalAmount.toLocaleString("vi-VN")}đ</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top selling books */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sách bán chạy</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/books">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {books.slice(0, 5).map((book, index) => (
                <div key={book.id} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{book.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{book.soldCount || 0}</p>
                    <p className="text-xs text-muted-foreground">đã bán</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/admin/books/new">
                <BookOpen className="h-5 w-5" />
                <span>Thêm sách mới</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/admin/categories">
                <Tag className="h-5 w-5" />
                <span>Quản lý danh mục</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/admin/inventory">
                <Package className="h-5 w-5" />
                <span>Nhập kho</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/admin/orders">
                <ShoppingCart className="h-5 w-5" />
                <span>Xử lý đơn hàng</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/admin/support">
                <HeadphonesIcon className="h-5 w-5" />
                <span>Hỗ trợ khách hàng</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/admin/reports">
                <TrendingUp className="h-5 w-5" />
                <span>Xem báo cáo</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
