"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
} from "lucide-react"
import { statsApi, type DashboardStats } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { hasPermission } from "@/lib/permissions"

export default function AdminDashboard() {
  const { user } = useAuth()
  const canViewRevenue = hasPermission(user, "view_revenue")
  const isAdmin = user?.role === "admin"
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    statsApi
      .getDashboard()
      .then(setStats)
      .catch(() => setError("Không tải được dữ liệu. Hãy đăng nhập lại."))
      .finally(() => setLoading(false))
  }, [])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Đang tải dashboard...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive">{error || "Lỗi tải dữ liệu"}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    )
  }

  const statCards = [
    ...(canViewRevenue
      ? [
          {
            title: "Tổng doanh thu",
            value: (stats.totalRevenue ?? 0).toLocaleString("vi-VN") + "đ",
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50",
          },
        ]
      : []),
    {
      title: "Tổng đơn hàng",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng sách",
      value: stats.totalBooks.toString(),
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    ...(canViewRevenue
      ? [
          {
            title: "Khách hàng",
            value: (stats.totalUsers ?? 0).toString(),
            icon: Users,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Tổng quan hoạt động kinh doanh (dữ liệu thời gian thực)"
            : "Tổng quan vận hành cửa hàng"}
        </p>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">Chưa có đơn hàng</p>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName || order.customerEmail || order.userId}
                      </p>
                    </div>
                    <div className="text-right">
                      {canViewRevenue && order.totalAmount != null && (
                        <p className="font-medium">
                          {order.totalAmount.toLocaleString("vi-VN")}đ
                        </p>
                      )}
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${getStatusColor(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-50">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đơn chờ xử lý</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-50">
                <Package className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sách sắp hết hàng</p>
                <p className="text-2xl font-bold">{stats.lowStockBooks}</p>
              </div>
            </CardContent>
          </Card>
          {isAdmin && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Hệ thống API</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Dashboard đồng bộ từ database PostgreSQL
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
