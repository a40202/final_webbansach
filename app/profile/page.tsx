'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Package, Heart, Settings, LogOut, ChevronRight } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth, useRequireAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

const sidebarLinks = [
  { icon: User, label: 'Thông tin cá nhân', href: '/profile' },
  { icon: Package, label: 'Đơn hàng của tôi', href: '/orders' },
  { icon: Heart, label: 'Sách yêu thích', href: '/wishlist' },
  { icon: Settings, label: 'Cài đặt', href: '/settings' },
]

export default function ProfilePage() {
  const { user: requiredUser, isLoading: authLoading } = useRequireAuth()
  const { user, logout, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  if (authLoading || !requiredUser || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await updateProfile(formData)
    
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }

    setIsLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    setIsLoading(true)
    
    // Simulate password change
    await new Promise(resolve => setTimeout(resolve, 500))
    
    toast.success('Đổi mật khẩu thành công!')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setIsLoading(false)
  }

  const handleLogout = () => {
    logout()
    // router.push('/')  // Nếu bạn import useRouter thì mở dòng này
    toast.success('Đăng xuất thành công!')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-secondary/50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Trang chủ</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Tài khoản</span>
          </nav>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-lg border p-6">
                {/* User info */}
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="text-lg">{user.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{user.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <Separator className="mb-4" />

                {/* Navigation */}
                <nav className="space-y-1">
                  {sidebarLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        link.href === '/profile'
                          ? 'bg-secondary text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-lg border">
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 px-6">
                    <TabsTrigger
                      value="profile"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
                    >
                      Thông tin cá nhân
                    </TabsTrigger>
                    <TabsTrigger
                      value="password"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
                    >
                      Đổi mật khẩu
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="p-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user.email}
                          disabled
                          className="bg-secondary"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email không thể thay đổi
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fullName">Họ tên</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="Nhập họ tên"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Địa chỉ</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Nhập địa chỉ"
                          rows={3}
                        />
                      </div>

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="password" className="p-6">
                    <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Nhập mật khẩu hiện tại"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Nhập mật khẩu mới"
                          minLength={6}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Nhập lại mật khẩu mới"
                          required
                        />
                      </div>

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}