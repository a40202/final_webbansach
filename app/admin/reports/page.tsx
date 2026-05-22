"use client"

import { useState, useEffect } from "react"
import { statsApi, type ReportsStats } from "@/lib/api"
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
  const [stats, setStats] = useState<ReportsStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    statsApi
      .getReports(timeRange)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [timeRange])

  const placeholder = {
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    avgOrderValue: 0,
    revenueChange: 0,
    ordersChange: 0,
    topBooks: [] as ReportsStats["topBooks"],
    ordersByStatus: {} as Record<string, number>,
    revenueByMonth: [] as ReportsStats["revenueByMonth"],
  }

  const data = stats ?? placeholder

  const monthlyData = data.revenueByMonth.map((m) => ({
    month: m.month,
    revenue: m.revenue,
    orders: m.orders,
  }))
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1)
  const topBooks = data.topBooks

  const statusLabels: Record<string, string> = {
    pending: "Cho xac nhan",
    confirmed: "Da xac nhan",
    shipping: "Dang giao",
    delivered: "Da giao",
    cancelled: "Da huy",
  }

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

      {loading && (
        <p className="text-muted-foreground text-sm">Dang tai bao cao...</p>
      )}

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Doanh thu</p>
                <p className="text-2xl font-bold">{data.totalRevenue.toLocaleString("vi-VN")}d</p>
                <div className="flex items-center gap-1 mt-1">
                  {data.revenueChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${data.revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {data.revenueChange >= 0 ? "+" : ""}{data.revenueChange}%
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
                <p className="text-2xl font-bold">{data.totalOrders}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.completedOrders} hoan thanh
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
                <p className="text-2xl font-bold">{Math.round(data.avgOrderValue).toLocaleString("vi-VN")}d</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.cancelledOrders} don huy
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
                <p className="text-sm text-muted-foreground">Bien dong don</p>
                <p className="text-2xl font-bold">{data.ordersChange >= 0 ? "+" : ""}{data.ordersChange}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  so voi ky truoc
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
                  {topBooks.map((item, index) => (
                      <TableRow key={item.bookId}>
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
                          <p className="font-medium line-clamp-1">{item.title}</p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">—</TableCell>
                        <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          {item.revenue.toLocaleString("vi-VN")}d
                        </TableCell>
                      </TableRow>
                    ))}
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
          <Card>
            <CardHeader>
              <CardTitle>Don hang theo trang thai</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(data.ordersByStatus).map(([status, count]) => {
                const total = Object.values(data.ordersByStatus).reduce((a, b) => a + b, 0)
                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{statusLabels[status] || status}</span>
                      <span className="text-sm text-muted-foreground">{count} don ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
