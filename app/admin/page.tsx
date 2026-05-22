"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    statsApi
      .getDashboard()
      .then(setStats)
      .catch(() => setError("Khong tai duoc du lieu. Hay dang nhap lai tai khoan admin."))
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
      case "pending": return "Cho xac nhan"
      case "confirmed": return "Da xac nhan"
      case "shipping": return "Dang giao"
      case "delivered": return "Da giao"
      case "cancelled": return "Da huy"
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Dang tai dashboard...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive">{error || "Loi tai du lieu"}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Thu lai
        </Button>
      </div>
    )
  }

  const statCards = [
    {
      title: "Tong doanh thu",
      value: stats.totalRevenue.toLocaleString("vi-VN") + "d",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tong don hang",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tong sach",
      value: stats.totalBooks.toString(),
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Khach hang",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Tong quan hoat dong kinh doanh (du lieu thoi gian thuc)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <CardTitle>Don hang gan day</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">Xem tat ca</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">Chua co don hang</p>
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
                      <p className="font-medium">
                        {order.totalAmount.toLocaleString("vi-VN")}d
                      </p>
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
                <p className="text-sm text-muted-foreground">Don cho xu ly</p>
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
                <p className="text-sm text-muted-foreground">Sach sap het hang</p>
                <p className="text-2xl font-bold">{stats.lowStockBooks}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">He thong API</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Dashboard dong bo tu database PostgreSQL
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
