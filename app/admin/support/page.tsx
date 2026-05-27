"use client"

import { useState } from "react"
import { users, orders } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  HeadphonesIcon,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Send,
  Eye,
  Phone,
  Mail,
} from "lucide-react"
import { toast } from "sonner"

interface SupportTicket {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved"
  priority: "low" | "medium" | "high"
  createdAt: string
  orderId?: string
  response?: string
}

const initialTickets: SupportTicket[] = [
  {
    id: "TK001",
    customerId: "3",
    customerName: "Nguyễn Văn A",
    customerEmail: "customer@gmail.com",
    subject: "Đơn hàng ORD001 chưa nhận được",
    message:
      "Tôi đặt hàng ngày 01/05 nhưng đã 7 ngày chưa nhận được. Vui lòng kiểm tra giúp tôi.",
    status: "open",
    priority: "high",
    createdAt: "2024-05-08",
    orderId: "ORD001",
  },
  {
    id: "TK002",
    customerId: "4",
    customerName: "Trần Thị B",
    customerEmail: "tran.thi.b@gmail.com",
    subject: "Sách bị hỏng, muốn đổi trả",
    message:
      "Sách tôi nhận được bị nhăn trang, ảnh hưởng nhiều đến việc đọc. Tôi muốn đổi sách mới.",
    status: "in_progress",
    priority: "medium",
    createdAt: "2024-05-10",
    response:
      "Chúng tôi đã ghi nhận phản ánh của bạn và đang xử lý. Vui lòng gửi ảnh sách bị lỗi để chúng tôi xác nhận.",
  },
  {
    id: "TK003",
    customerId: "3",
    customerName: "Nguyễn Văn A",
    customerEmail: "customer@gmail.com",
    subject: "Hỏi về chính sách hoàn tiền",
    message: "Tôi muốn biết thời gian hoàn tiền sau khi hủy đơn hàng là bao lâu?",
    status: "resolved",
    priority: "low",
    createdAt: "2024-05-05",
    response:
      "Thời gian hoàn tiền là 3-5 ngày làm việc với chuyển khoản ngân hàng, và 7-10 ngày với ví điện tử. Cảm ơn bạn đã liên hệ!",
  },
]

const priorityConfig = {
  high: { label: "Cao", color: "bg-red-100 text-red-700" },
  medium: { label: "Trung bình", color: "bg-yellow-100 text-yellow-700" },
  low: { label: "Thấp", color: "bg-green-100 text-green-700" },
}

const statusConfig = {
  open: { label: "Chờ xử lý", color: "bg-orange-100 text-orange-700", icon: Clock },
  in_progress: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  resolved: { label: "Đã giải quyết", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [responseText, setResponseText] = useState("")

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === "all" || t.status === statusFilter
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  const openCount = tickets.filter((t) => t.status === "open").length
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length

  const openDetail = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setResponseText(ticket.response || "")
    setIsDetailOpen(true)
  }

  const handleSendResponse = () => {
    if (!selectedTicket || !responseText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi")
      return
    }
    setTickets(
      tickets.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, response: responseText.trim(), status: "in_progress" as const }
          : t
      )
    )
    setSelectedTicket({ ...selectedTicket, response: responseText.trim(), status: "in_progress" })
    toast.success("Đã gửi phản hồi đến khách hàng")
  }

  const handleResolve = () => {
    if (!selectedTicket) return
    setTickets(
      tickets.map((t) =>
        t.id === selectedTicket.id ? { ...t, status: "resolved" as const } : t
      )
    )
    setSelectedTicket({ ...selectedTicket, status: "resolved" })
    toast.success("Đã đánh dấu ticket là đã giải quyết")
    setIsDetailOpen(false)
  }

  const handleUpdateStatus = (ticketId: string, status: SupportTicket["status"]) => {
    setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status })
    }
    toast.success("Đã cập nhật trạng thái")
  }

  const customerOrders = selectedTicket
    ? orders.filter((o) => o.userId === selectedTicket.customerId)
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Hỗ trợ khách hàng</h1>
        <p className="text-muted-foreground">
          Quản lý và phản hồi các yêu cầu hỗ trợ từ khách hàng
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-50">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chờ xử lý</p>
              <p className="text-2xl font-bold text-orange-600">{openCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-50">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang xử lý</p>
              <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã giải quyết</p>
              <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tiêu đề, tên khách hàng, mã ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="open">Chờ xử lý</SelectItem>
                <SelectItem value="in_progress">Đang xử lý</SelectItem>
                <SelectItem value="resolved">Đã giải quyết</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Mức độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mức độ</SelectItem>
                <SelectItem value="high">Cao</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="low">Thấp</SelectItem>
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
                  <TableHead>Mã ticket</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="hidden md:table-cell">Khách hàng</TableHead>
                  <TableHead className="text-center">Mức độ</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ticket) => {
                  const statusCfg = statusConfig[ticket.status]
                  const priorityCfg = priorityConfig[ticket.priority]
                  const StatusIcon = statusCfg.icon
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {ticket.id}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium line-clamp-1">{ticket.subject}</p>
                        {ticket.orderId && (
                          <p className="text-xs text-muted-foreground">
                            Đơn hàng: {ticket.orderId}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="font-medium text-sm">{ticket.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.customerEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${priorityCfg.color}`}
                        >
                          {priorityCfg.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {ticket.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetail(ticket)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem & Phản hồi
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Không có ticket nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeadphonesIcon className="h-5 w-5" />
              Ticket {selectedTicket?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <Tabs defaultValue="ticket">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ticket">Nội dung yêu cầu</TabsTrigger>
                <TabsTrigger value="customer">Thông tin khách hàng</TabsTrigger>
              </TabsList>

              <TabsContent value="ticket" className="space-y-4 pt-4">
                {/* Status & Priority */}
                <div className="flex flex-wrap gap-3 items-center">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      statusConfig[selectedTicket.status].color
                    }`}
                  >
                    {statusConfig[selectedTicket.status].label}
                  </span>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      priorityConfig[selectedTicket.priority].color
                    }`}
                  >
                    Ưu tiên: {priorityConfig[selectedTicket.priority].label}
                  </span>
                  {selectedTicket.orderId && (
                    <span className="text-sm text-muted-foreground">
                      Liên quan đơn hàng:{" "}
                      <span className="font-medium">{selectedTicket.orderId}</span>
                    </span>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <p className="text-sm text-muted-foreground">Tiêu đề</p>
                  <p className="font-semibold mt-1">{selectedTicket.subject}</p>
                </div>

                {/* Message from customer */}
                <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{selectedTicket.customerName}</span>
                    <span>·</span>
                    <span>{selectedTicket.createdAt}</span>
                  </div>
                  <p className="text-sm">{selectedTicket.message}</p>
                </div>

                {/* Existing response */}
                {selectedTicket.response && (
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                    <div className="flex items-center gap-2 mb-2 text-sm text-blue-600">
                      <HeadphonesIcon className="h-4 w-4" />
                      <span className="font-medium">Phản hồi của nhân viên</span>
                    </div>
                    <p className="text-sm">{selectedTicket.response}</p>
                  </div>
                )}

                {/* Response form */}
                <div className="space-y-3 pt-2 border-t">
                  <Label htmlFor="response">
                    {selectedTicket.response ? "Cập nhật phản hồi" : "Phản hồi khách hàng"}
                  </Label>
                  <Textarea
                    id="response"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..."
                    rows={4}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleSendResponse} className="flex-1 sm:flex-none">
                      <Send className="h-4 w-4 mr-2" />
                      Gửi phản hồi
                    </Button>
                    {selectedTicket.status !== "resolved" && (
                      <Button
                        variant="outline"
                        onClick={handleResolve}
                        className="flex-1 sm:flex-none text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Đánh dấu đã giải quyết
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quick status update */}
                <div className="flex items-center gap-3 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Cập nhật trạng thái:</span>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(v) =>
                      handleUpdateStatus(
                        selectedTicket.id,
                        v as SupportTicket["status"]
                      )
                    }
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Chờ xử lý</SelectItem>
                      <SelectItem value="in_progress">Đang xử lý</SelectItem>
                      <SelectItem value="resolved">Đã giải quyết</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="customer" className="space-y-4 pt-4">
                {/* Customer info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xl">
                      {selectedTicket.customerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      {selectedTicket.customerName}
                    </p>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {selectedTicket.customerEmail}
                      </div>
                      {users.find((u) => u.id === selectedTicket.customerId)
                        ?.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {
                            users.find(
                              (u) => u.id === selectedTicket.customerId
                            )?.phone
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer orders */}
                <div>
                  <p className="font-medium mb-3">
                    Lịch sử đơn hàng ({customerOrders.length})
                  </p>
                  {customerOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Không có đơn hàng nào
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {customerOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm"
                        >
                          <div>
                            <span className="font-medium">{order.id}</span>
                            <span className="text-muted-foreground ml-2">
                              {order.createdAt}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {order.totalAmount.toLocaleString("vi-VN")}đ
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {order.status === "delivered"
                                ? "Đã giao"
                                : order.status === "cancelled"
                                ? "Đã hủy"
                                : order.status === "pending"
                                ? "Chờ xác nhận"
                                : order.status === "confirmed"
                                ? "Đã xác nhận"
                                : "Đang giao"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
