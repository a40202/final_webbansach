'use client'

import { useEffect, useState } from 'react'
import { returnsApi, ApiError, type ReturnRequest, type ReturnStatusType } from '@/lib/api'
import { formatPrice } from '@/lib/data'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Eye, RotateCcw } from 'lucide-react'

const statusLabels: Record<ReturnStatusType, string> = {
  pending: 'Chờ xử lý',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  received: 'Đã nhận hàng trả',
  refunded: 'Đã hoàn tiền',
  cancelled: 'Đã hủy',
}

const statusColors: Record<ReturnStatusType, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  received: 'bg-purple-100 text-purple-800',
  refunded: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const reasonLabels: Record<string, string> = {
  defective: 'Sản phẩm lỗi',
  wrong_item: 'Giao sai hàng',
  not_as_described: 'Không đúng mô tả',
  changed_mind: 'Đổi ý',
  other: 'Khác',
}

const nextStatusOptions: Record<ReturnStatusType, ReturnStatusType[]> = {
  pending: ['approved', 'rejected'],
  approved: ['received', 'cancelled'],
  rejected: [],
  received: ['refunded'],
  refunded: [],
  cancelled: [],
}

export default function AdminReturnsPage() {
  const [list, setList] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selected, setSelected] = useState<ReturnRequest | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [newStatus, setNewStatus] = useState<ReturnStatusType | ''>('')

  const load = () => {
    setLoading(true)
    returnsApi
      .getAll()
      .then(setList)
      .catch((e) =>
        toast.error(
          e instanceof ApiError ? e.message : 'Không tải được yêu cầu trả hàng',
        ),
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = list.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch =
      r.id.toLowerCase().includes(q) ||
      r.orderId.toLowerCase().includes(q) ||
      (r.customerName || '').toLowerCase().includes(q) ||
      (r.customerEmail || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const openDetail = (r: ReturnRequest) => {
    setSelected(r)
    setAdminNote(r.adminNote || '')
    setNewStatus('')
  }

  const handleUpdateStatus = async () => {
    if (!selected || !newStatus) return
    try {
      const updated = await returnsApi.updateStatus(
        selected.id,
        newStatus,
        adminNote || undefined,
        selected.refundAmount,
      )
      setList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      setSelected(updated)
      toast.success('Cập nhật trạng thái thành công')
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Cập nhật thất bại',
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <RotateCcw className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Quản lý trả hàng</h1>
          <p className="text-muted-foreground text-sm">
            Tiếp nhận và xử lý yêu cầu trả hàng từ khách hàng
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách yêu cầu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã, đơn hàng, khách hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {(Object.keys(statusLabels) as ReturnStatusType[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Đang tải...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Không có yêu cầu trả hàng
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Hoàn tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.id}</TableCell>
                      <TableCell>{r.orderId}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{r.customerName}</p>
                          <p className="text-muted-foreground text-xs">
                            {r.customerEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {reasonLabels[r.reason] || r.reason}
                      </TableCell>
                      <TableCell>
                        {r.refundAmount != null
                          ? formatPrice(r.refundAmount)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}
                        >
                          {statusLabels[r.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.createdAt}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetail(r)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xử lý
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết trả hàng #{selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground">Đơn hàng</p>
                  <p className="font-medium">{selected.orderId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Khách hàng</p>
                  <p className="font-medium">{selected.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.customerEmail}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Lý do</p>
                <Badge variant="secondary">
                  {reasonLabels[selected.reason] || selected.reason}
                </Badge>
                <p className="mt-2">{selected.description}</p>
              </div>

              <div>
                <p className="font-medium mb-2">Sản phẩm trả</p>
                <ul className="space-y-1 border rounded-lg p-3">
                  {selected.items.map((item) => (
                    <li
                      key={item.bookId}
                      className="flex justify-between gap-2"
                    >
                      <span>
                        {item.bookTitle || item.bookId} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                {selected.refundAmount != null && (
                  <p className="text-right font-semibold mt-2 text-primary">
                    Tổng hoàn: {formatPrice(selected.refundAmount)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Trạng thái hiện tại</p>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selected.status]}`}
                >
                  {statusLabels[selected.status]}
                </span>
              </div>

              {nextStatusOptions[selected.status].length > 0 && (
                <>
                  <div>
                    <p className="font-medium mb-1">Cập nhật trạng thái</p>
                    <Select
                      value={newStatus}
                      onValueChange={(v) =>
                        setNewStatus(v as ReturnStatusType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái mới" />
                      </SelectTrigger>
                      <SelectContent>
                        {nextStatusOptions[selected.status].map((s) => (
                          <SelectItem key={s} value={s}>
                            {statusLabels[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Ghi chú admin</p>
                    <Textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Hướng dẫn khách gửi hàng, lý do từ chối..."
                      rows={3}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!newStatus}
                    onClick={handleUpdateStatus}
                  >
                    Lưu cập nhật
                  </Button>
                </>
              )}

              {selected.adminNote && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-medium text-xs text-muted-foreground">
                    Ghi chú đã lưu
                  </p>
                  <p>{selected.adminNote}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}