'use client'

import { useEffect, useState } from 'react'
import { returnsApi, type ReturnRequest, type ReturnStatusType } from '@/lib/api'
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
  pending: 'Cho xu ly',
  approved: 'Da duyet',
  rejected: 'Tu choi',
  received: 'Da nhan hang tra',
  refunded: 'Da hoan tien',
  cancelled: 'Da huy',
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
  defective: 'San pham loi',
  wrong_item: 'Giao sai hang',
  not_as_described: 'Khong dung mo ta',
  changed_mind: 'Doi y',
  other: 'Khac',
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
      .catch(() => toast.error('Khong tai duoc yeu cau tra hang'))
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
      toast.success('Cap nhat trang thai thanh cong')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cap nhat that bai')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <RotateCcw className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Quan ly tra hang</h1>
          <p className="text-muted-foreground text-sm">
            Tiep nhan va xu ly yeu cau tra hang tu khach hang
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sach yeu cau</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tim theo ma, don hang, khach hang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Trang thai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tat ca</SelectItem>
                {(Object.keys(statusLabels) as ReturnStatusType[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Dang tai...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Khong co yeu cau tra hang
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ma</TableHead>
                    <TableHead>Don hang</TableHead>
                    <TableHead>Khach hang</TableHead>
                    <TableHead>Ly do</TableHead>
                    <TableHead>Hoan tien</TableHead>
                    <TableHead>Trang thai</TableHead>
                    <TableHead>Ngay</TableHead>
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
                          Xu ly
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
            <DialogTitle>Chi tiet tra hang #{selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground">Don hang</p>
                  <p className="font-medium">{selected.orderId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Khach hang</p>
                  <p className="font-medium">{selected.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.customerEmail}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Ly do</p>
                <Badge variant="secondary">
                  {reasonLabels[selected.reason] || selected.reason}
                </Badge>
                <p className="mt-2">{selected.description}</p>
              </div>

              <div>
                <p className="font-medium mb-2">San pham tra</p>
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
                    Tong hoan: {formatPrice(selected.refundAmount)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Trang thai hien tai</p>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selected.status]}`}
                >
                  {statusLabels[selected.status]}
                </span>
              </div>

              {nextStatusOptions[selected.status].length > 0 && (
                <>
                  <div>
                    <p className="font-medium mb-1">Cap nhat trang thai</p>
                    <Select
                      value={newStatus}
                      onValueChange={(v) =>
                        setNewStatus(v as ReturnStatusType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chon trang thai moi" />
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
                    <p className="font-medium mb-1">Ghi chu admin</p>
                    <Textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Huong dan khach gui hang, ly do tu choi..."
                      rows={3}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!newStatus}
                    onClick={handleUpdateStatus}
                  >
                    Luu cap nhat
                  </Button>
                </>
              )}

              {selected.adminNote && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-medium text-xs text-muted-foreground">
                    Ghi chu da luu
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
