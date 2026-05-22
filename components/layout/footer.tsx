import Link from 'next/link'
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  shop: [
    { name: 'Tất cả sách', href: '/books' },
    { name: 'Sách bán chạy', href: '/books?filter=bestseller' },
    { name: 'Sách mới', href: '/books?filter=new' },
    { name: 'Khuyến mãi', href: '/sale' },
  ],
  categories: [
    { name: 'Văn học', href: '/books?category=van-hoc' },
    { name: 'Kinh tế', href: '/books?category=kinh-te' },
    { name: 'Tâm lý', href: '/books?category=tam-ly-ky-nang-song' },
    { name: 'Thiếu nhi', href: '/books?category=thieu-nhi' },
  ],
  support: [
    { name: 'Liên hệ', href: '/contact' },
    { name: 'Chính sách đổi trả', href: '/policy/return' },
    { name: 'Chính sách vận chuyển', href: '/policy/shipping' },
    { name: 'Hướng dẫn mua hàng', href: '/guide' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-8 w-8" />
              <span className="font-serif text-2xl font-semibold">BookStore</span>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
              Nhà sách trực tuyến hàng đầu Việt Nam với hàng ngàn đầu sách chất lượng và giá cả hợp lý.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>123 Nguyễn Văn Linh, Quận 7, TP.HCM</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>1900 1234 56</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>support@bookstore.vn</span>
              </div>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="font-semibold mb-4">Cửa hàng</h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Category links */}
          <div>
            <h3 className="font-semibold mb-4">Thể loại</h3>
            <ul className="space-y-2.5">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/80">
              © 2024 BookStore. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/policy/privacy"
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link
                href="/policy/terms"
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}