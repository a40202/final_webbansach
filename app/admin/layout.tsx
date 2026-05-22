"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  LayoutDashboard, 
  BookOpen, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Tag,
  HeadphonesIcon,
  Percent,
  FileText,
  Receipt,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "staff"] },
  { href: "/admin/books", label: "Quan ly sach", icon: BookOpen, roles: ["admin", "staff"] },
  { href: "/admin/categories", label: "Quan ly danh muc", icon: Tag, roles: ["admin", "staff"] },
  { href: "/admin/inventory", label: "Quan ly kho", icon: Package, roles: ["admin", "staff"] },
  { href: "/admin/orders", label: "Quan ly don hang", icon: ShoppingCart, roles: ["admin", "staff"] },
  { href: "/admin/returns", label: "Tra hang", icon: RotateCcw, roles: ["admin", "staff"] },
  { href: "/admin/invoices", label: "Hoa don", icon: Receipt, roles: ["admin", "staff"] },
  { href: "/admin/promotions", label: "Khuyen mai", icon: Percent, roles: ["admin", "staff"] },
  { href: "/admin/articles", label: "Quan ly bai viet", icon: FileText, roles: ["admin", "staff"] },
  { href: "/admin/users", label: "Quan ly nguoi dung", icon: Users, roles: ["admin"] },
  { href: "/admin/support", label: "Ho tro khach hang", icon: HeadphonesIcon, roles: ["admin", "staff"] },
  { href: "/admin/reports", label: "Thong ke bao cao", icon: BarChart3, roles: ["admin", "staff"] },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState("")

  const isStaff =
    user?.role === "admin" || user?.role === "staff"

  useEffect(() => {
    if (isLoading) return
    if (!isStaff) {
      router.replace("/login")
    }
    setCurrentPath(window.location.pathname)
  }, [user, isLoading, isStaff, router])

  if (isLoading || !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <Link href="/admin" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">BookStore Admin</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.filter((item) => item.roles.includes(user.role)).map((item) => {
                const isActive = currentPath === item.href || 
                  (item.href !== "/admin" && currentPath.startsWith(item.href))
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        setCurrentPath(item.href)
                        setSidebarOpen(false)
                      }}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                        ${isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {( user.name || user.fullName).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name || user.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                asChild
              >
                <Link href="/">Về trang chủ</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Xin chào, <span className="font-medium text-foreground">{user.name || user.fullName}</span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
