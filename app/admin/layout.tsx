"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
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
  Tag,
  HeadphonesIcon,
  Percent,
  FileText,
  Receipt,
  RotateCcw,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  canAccessAdmin,
  hasPermission,
  type PermissionKey,
} from "@/lib/permissions"

const menuItems: {
  href: string
  label: string
  icon: typeof LayoutDashboard
  permission: PermissionKey
  adminOnly?: boolean
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { href: "/admin/books", label: "Quản lý sách", icon: BookOpen, permission: "books" },
  { href: "/admin/categories", label: "Quản lý danh mục", icon: Tag, permission: "categories" },
  { href: "/admin/inventory", label: "Quản lý kho", icon: Package, permission: "inventory" },
  { href: "/admin/orders", label: "Quản lý đơn hàng", icon: ShoppingCart, permission: "orders" },
  { href: "/admin/returns", label: "Trả hàng", icon: RotateCcw, permission: "returns" },
  { href: "/admin/invoices", label: "Hóa đơn", icon: Receipt, permission: "invoices" },
  { href: "/admin/promotions", label: "Khuyến mãi", icon: Percent, permission: "promotions" },
  { href: "/admin/articles", label: "Quản lý bài viết", icon: FileText, permission: "articles" },
  { href: "/admin/users", label: "Quản lý người dùng", icon: Users, permission: "users", adminOnly: true },
  { href: "/admin/support", label: "Hỗ trợ khách hàng", icon: HeadphonesIcon, permission: "support" },
  { href: "/admin/reports", label: "Thống kê báo cáo", icon: BarChart3, permission: "reports" },
  { href: "/admin/permissions", label: "Phân quyền", icon: Shield, permission: "users", adminOnly: true },
]

const pathPermission: Record<string, PermissionKey> = {
  "/admin": "dashboard",
  "/admin/books": "books",
  "/admin/categories": "categories",
  "/admin/inventory": "inventory",
  "/admin/orders": "orders",
  "/admin/returns": "returns",
  "/admin/invoices": "invoices",
  "/admin/promotions": "promotions",
  "/admin/articles": "articles",
  "/admin/users": "users",
  "/admin/support": "support",
  "/admin/reports": "reports",
  "/admin/permissions": "users",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState("")

  const canAdmin = canAccessAdmin(user)

  const visibleMenu = useMemo(
    () =>
      menuItems.filter((item) => {
        if (item.adminOnly && user?.role !== "admin") return false
        return hasPermission(user, item.permission)
      }),
    [user],
  )

  useEffect(() => {
    if (isLoading) return
    if (!canAdmin) {
      router.replace("/login")
      return
    }
    const path = window.location.pathname
    setCurrentPath(path)
    const match = Object.keys(pathPermission)
      .filter((p) => p !== "/admin" && path.startsWith(p))
      .sort((a, b) => b.length - a.length)[0]
    const base = match ?? (path === "/admin" ? "/admin" : null)
    if (!base || !user) return
    if (hasPermission(user, pathPermission[base])) return
    const fallback = visibleMenu[0]?.href
    if (fallback && path !== fallback) {
      router.replace(fallback)
    }
  }, [user, isLoading, canAdmin, router, visibleMenu])

  if (isLoading || !canAdmin || !user) {
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
              {visibleMenu.map((item) => {
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
