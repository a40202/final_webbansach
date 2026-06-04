import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ['latin', 'vietnamese'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'BookStore - Nhà Sách Trực Tuyến',
  description: 'Nhà sách trực tuyến hàng đầu Việt Nam. Tìm kiếm và mua sách với giá tốt nhất.',
  keywords: 'sách, nhà sách, mua sách online, sách hay, bookstore',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}