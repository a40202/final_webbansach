'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Mail, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    toast.success('Da gui email huong dan dat lai mat khau!')
    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          
          <div>
            <h1 className="font-serif text-2xl font-semibold">Kiem tra email cua ban</h1>
            <p className="text-muted-foreground mt-2">
              Chung toi da gui huong dan dat lai mat khau den <strong>{email}</strong>. 
              Vui long kiem tra hop thu den va lam theo huong dan.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Khong nhan duoc email?
            </p>
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>
              Gui lai
            </Button>
          </div>

          <Link href="/login" className="inline-flex items-center text-sm text-accent hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lai dang nhap
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
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
          <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-semibold">Quen mat khau?</h1>
          <p className="text-muted-foreground mt-2">
            Nhap email cua ban va chung toi se gui huong dan dat lai mat khau.
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Dang gui...' : 'Gui yeu cau'}
          </Button>
        </form>

        {/* Back to login */}
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lai dang nhap
          </Link>
        </div>
      </div>
    </div>
  )
}
