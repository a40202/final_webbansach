'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      toast.success(result.message)
      router.push('/')
    } else {
      toast.error(result.message)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <BookOpen className="h-10 w-10 text-primary" />
              <span className="font-serif text-2xl font-semibold">BookStore</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="font-serif text-3xl font-semibold">Dang nhap</h1>
            <p className="text-muted-foreground mt-2">
              Chao mung ban quay tro lai
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mat khau</Label>
                <Link href="/forgot-password" className="text-sm text-accent hover:underline">
                  Quen mat khau?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhap mat khau"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Dang dang nhap...' : 'Dang nhap'}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="bg-secondary p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Tai khoan demo:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Admin: admin@bookstore.com / admin123</p>
              <p>Nhan vien: staff@bookstore.com / staff123</p>
              <p>Khach hang: customer@gmail.com / customer123</p>
            </div>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground">
            Chua co tai khoan?{' '}
            <Link href="/register" className="text-accent font-medium hover:underline">
              Dang ky ngay
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-secondary relative">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <h2 className="font-serif text-4xl font-semibold mb-4">
              Kham pha kho tang tri thuc
            </h2>
            <p className="text-muted-foreground">
              Hang ngan dau sach hay dang cho ban. Dang nhap de trai nghiem dich vu tot nhat.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
