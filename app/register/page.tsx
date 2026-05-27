'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Eye, EyeOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    address: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mat khau xac nhan khong khop')
      return
    }

    if (!acceptTerms) {
      toast.error('Vui long dong y voi dieu khoan su dung')
      return
    }

    setIsLoading(true)

    const result = await register({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
    })
    
    if (result.success) {
      toast.success(result.message)
      router.push('/')
    } else {
      toast.error(result.message)
    }

    setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-secondary relative">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md">
            <h2 className="font-serif text-4xl font-semibold mb-6">
              Tro thanh thanh vien cua BookStore
            </h2>
            <ul className="space-y-4">
              {[
                'Nhan uu dai doc quyen danh cho thanh vien',
                'Theo doi don hang de dang',
                'Luu sach yeu thich de mua sau',
                'Nhan thong bao ve sach moi va khuyen mai',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-accent-foreground" />
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <BookOpen className="h-10 w-10 text-primary" />
              <span className="font-serif text-2xl font-semibold">BookStore</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="font-serif text-3xl font-semibold">Dang ky tai khoan</h1>
            <p className="text-muted-foreground mt-2">
              Tao tai khoan moi de bat dau mua sam
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="fullName">Ho ten *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Nguyen Van A"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">So dien thoai *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mat khau *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Toi thieu 6 ky tu"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xac nhan mat khau *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Nhap lai mat khau"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="address">Dia chi</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Dia chi giao hang mac dinh"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
                Toi dong y voi{' '}
                <Link href="/policy/terms" className="text-accent hover:underline">
                  Dieu khoan su dung
                </Link>{' '}
                va{' '}
                <Link href="/policy/privacy" className="text-accent hover:underline">
                  Chinh sach bao mat
                </Link>{' '}
                cua BookStore.
              </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Dang xu ly...' : 'Dang ky'}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground">
            Da co tai khoan?{' '}
            <Link href="/login" className="text-accent font-medium hover:underline">
              Dang nhap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
