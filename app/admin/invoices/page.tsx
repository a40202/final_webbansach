"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { invoicesApi, type Invoice } from "@/lib/api"
import { formatPrice } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Eye } from "lucide-react"
import { toast } from "sonner"

const statusLabel: Record<string, string> = {
  unpaid: "Chua TT",
  paid: "Da TT",
  refunded: "Hoan tien",
}

export default function AdminInvoicesPage() {
  const [list, setList] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const load = () => {
    setLoading(true)
    invoicesApi
      .getAll()
      .then(setList)
      .catch(() => toast.error("Khong tai duoc hoa don"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered =
    filter === "all" ? list : list.filter((i) => i.paymentStatus === filter)

  const handlePaymentUpdate = async (id: string, status: Invoice["paymentStatus"]) => {
    try {
      await invoicesApi.updatePayment(id, status)
      toast.success("Cap nhat trang thai thanh toan")
      load()
    } catch {
      toast.error("Cap nhat that bai")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7" />
            Hoa don thanh toan
          </h1>
          <p className="text-muted-foreground">
            Tu dong tao khi khach dat hang
          </p>
        </div>
        <Button variant="outline" onClick={load}>
          Lam moi
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Danh sach hoa don</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca</SelectItem>
              <SelectItem value="unpaid">Chua TT</SelectItem>
              <SelectItem value="paid">Da TT</SelectItem>
              <SelectItem value="refunded">Hoan tien</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground">Dang tai...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ma HD</TableHead>
                  <TableHead>Don hang</TableHead>
                  <TableHead>Khach hang</TableHead>
                  <TableHead className="text-right">Tong</TableHead>
                  <TableHead>TT</TableHead>
                  <TableHead className="text-right">Thao tac</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-medium">{inv.id}</TableCell>
                    <TableCell>{inv.orderId}</TableCell>
                    <TableCell>
                      <p className="font-medium">{inv.buyerName}</p>
                      <p className="text-xs text-muted-foreground">{inv.buyerEmail}</p>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(inv.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={inv.paymentStatus}
                        onValueChange={(v) =>
                          handlePaymentUpdate(inv.id, v as Invoice["paymentStatus"])
                        }
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid">{statusLabel.unpaid}</SelectItem>
                          <SelectItem value="paid">{statusLabel.paid}</SelectItem>
                          <SelectItem value="refunded">{statusLabel.refunded}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/invoices/${inv.orderId}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && filtered.length === 0 && (
            <p className="text-center py-12 text-muted-foreground">Chua co hoa don</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
