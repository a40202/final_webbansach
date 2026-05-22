"use client"

import { useState, useMemo } from "react"
import { orders, books, users, categories } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  Download,
  BarChart3,
  PieChart
} from "lucide-react"

type TimeRange = "7days" | "30days" | "90days" | "year"

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30days")

  // Calculate stats based on time range
  const stats = useMemo(() => {
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case "7days":
        startDate.setDate(now.getDate() - 7)
        break
      case "30days":
        startDate.setDate(now.getDate() - 30)
        break
      case "90days":
        startDate.setDate(now.getDate() - 90)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const filteredOrders = orders.filter(
      (o) => new Date(o.createdAt) >= startDate
    )
    
    const completedOrders = filteredOrders.filter((o) => o.status === "delivered")
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalOrders = filteredOrders.length
    const cancelledOrders = filteredOrders.filter((o) => o.status === "cancelled").length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / completedOrders.length : 0

    // Calculate previous period for comparison
    const prevStartDate = new Date(startDate)
    const prevEndDate = new Date(startDate)
    switch (timeRange) {
      case "7days":
        prevStartDate.setDate(startDate.getDate() - 7)
        break
      case "30days":
        prevStartDate.setDate(startDate.getDate() - 30)
        break
      case "90days":
        prevStartDate.setDate(startDate.getDate() - 90)
        break
      case "year":
        prevStartDate.setFullYear(startDate.getFullYear() - 1)
        break
    }

    const prevOrders = orders.filter(
      (o) => new Date(o.createdAt) >= prevStartDate && new Date(o.createdAt) < prevEndDate
    )
    const prevCompletedOrders = prevOrders.filter((o) => o.status === "delivered")
    const prevRevenue = prevCompletedOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    const revenueChange = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) 
      : "0"

    return {
      totalRevenue,
      totalOrders,
      completedOrders: completedOrders.length,
      cancelledOrders,
      avgOrderValue,
      revenueChange: parseFloat(revenueChange),
      newCustomers: users.filter(
        (u) => u.role === "customer" && new Date(u.createdAt) >= startDate
      ).length,
    }
  }, [timeRange])

  // Top selling books
  const topBooks = useMemo(() => {
    const bookSales: Record<string, { book: typeof books[0]; quantity: number; revenue: number }> = {}
    
    orders
      .filter((o) => o.status === "delivered")
      .forEach((order) => {
        order.items.forEach((item) => {
          const book = books.find((b) => b.id === item.bookId)
          if (book) {
            if (!bookSales[book.id]) {
              bookSales[book.id] = { book, quantity: 0, revenue: 0 }
            }
            bookSales[book.id].quantity += item.quantity
            bookSales[book.id].revenue += item.price * item.quantity
          }
        })
      })

    return Object.values(bookSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [])

  // Category revenue
  const categoryStats = useMemo(() => {
    const catRevenue: Record<string, number> = {}
    
    orders
      .filter((o) => o.status === "delivered")
      .forEach((order) => {
        order.items.forEach((item) => {
          const book = books.find((b) => b.id === item.bookId)
          if (book) {
            const categoryId = book.categoryId
            if (!catRevenue[categoryId]) catRevenue[categoryId] = 0
            catRevenue[categoryId] += item.price * item.quantity
          }
        })
      })

    return categories
      .map((cat) => ({
        category: cat,
        revenue: catRevenue[cat.id] || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [])

  // Monthly revenue for chart simulation
  const monthlyData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString("vi-VN", { month: "short" })
      const monthOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt)
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear() &&
               o.status === "delivered"
      })
      const revenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      months.push({ month: monthName, revenue, orders: monthOrders.length })
    }
    return months
  }, [])

  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Thống kê & Báo cáo</h1>
          <p className="text-muted-foreground">Phân tích dữ liệu kinh doanh</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 ngày qua</SelectItem>
              <SelectItem value="30days">30 ngày qua</SelectItem>
              <SelectItem value="90days">90 ngày qua</SelectItem>
              <SelectItem value="year">1 năm qua</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Doanh thu</p>
                <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString("vi-VN")}đ</p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.revenueChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${stats.revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {stats.revenueChange >= 0 ? "+" : ""}{stats.revenueChange}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đơn hàng</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.completedOrders} hoàn thành
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Giá trị TB/đơn</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgOrderValue).toLocaleString("vi-VN")}đ</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.cancelledOrders} đơn hủy
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Khách hàng mới</p>
                <p className="text-2xl font-bold">{stats.newCustomers}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  trong kỳ báo cáo
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">
            <BarChart3 className="h-4 w-4 mr-2" />
            Doanh thu
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Sản phẩm
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChart className="h-4 w-4 mr-2" />
            Thể loại
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          {/* Revenue Chart (simplified bar chart) */}
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                      style={{ 
                        height: maxRevenue > 0 ? `${(data.revenue / maxRevenue) * 200}px` : "4px",
                        minHeight: "4px"
                      }}
                    />
                    <div className="text-center">
                      <p className="text-xs font-medium">{data.month}</p>
                      <p className="text-xs text-muted-foreground">
                        {(data.revenue / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Stats Table */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết theo tháng</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tháng</TableHead>
                    <TableHead className="text-center">Số đơn</TableHead>
                    <TableHead className="text-right">Doanh thu</TableHead>
                    <TableHead className="text-right">TB/đơn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{data.month}</TableCell>
                      <TableCell className="text-center">{data.orders}</TableCell>
                      <TableCell className="text-right">
                        {data.revenue.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell className="text-right">
                        {data.orders > 0 
                          ? Math.round(data.revenue / data.orders).toLocaleString("vi-VN") + "đ"
                          : "-"
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 sách bán chạy</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Sách</TableHead>
                    <TableHead className="hidden md:table-cell">Thể loại</TableHead>
                    <TableHead className="text-center">Đã bán</TableHead>
                    <TableHead className="text-right">Doanh thu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topBooks.map((item, index) => {
                    const category = categories.find((c) => c.id === item.book.categoryId)
                    return (
                      <TableRow key={item.book.id}>
                        <TableCell>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? "bg-yellow-100 text-yellow-800" :
                            index === 1 ? "bg-gray-100 text-gray-800" :
                            index === 2 ? "bg-orange-100 text-orange-800" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={item.book.coverImage}
                              alt={item.book.title}
                              className="w-10 h-14 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium line-clamp-1">{item.book.title}</p>
                              <p className="text-xs text-muted-foreground">{item.book.author}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{category?.name}</TableCell>
                        <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          {item.revenue.toLocaleString("vi-VN")}đ
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {topBooks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Chưa có dữ liệu
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Category Revenue Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo thể loại</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryStats.map((item) => {
                    const totalCatRevenue = categoryStats.reduce((sum, c) => sum + c.revenue, 0)
                    const percentage = totalCatRevenue > 0 
                      ? (item.revenue / totalCatRevenue * 100).toFixed(1) 
                      : 0
                    return (
                      <div key={item.category.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.category.name}</span>
                          <span className="text-sm text-muted-foreground">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.revenue.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Category Stats Table */}
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết theo thể loại</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thể loại</TableHead>
                      <TableHead className="text-center">Số sách</TableHead>
                      <TableHead className="text-right">Doanh thu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryStats.map((item) => {
                      const bookCount = books.filter((b) => b.categoryId === item.category.id).length
                      return (
                        <TableRow key={item.category.id}>
                          <TableCell className="font-medium">{item.category.name}</TableCell>
                          <TableCell className="text-center">{bookCount}</TableCell>
                          <TableCell className="text-right">
                            {item.revenue.toLocaleString("vi-VN")}đ
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
