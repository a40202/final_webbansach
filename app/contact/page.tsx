"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  FileText,
  CheckCircle2
} from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: "Địa chỉ",
      content: "Đ. Nghiêm Xuân Yêm, Định Công, Hà Nội 100000, Việt Nam",
      subContent: "Việt Nam"
    },
    {
      icon: Phone,
      title: "Điện thoại",
      content: "1900 1234",
      subContent: "Hotline (8:00 - 22:00)"
    },
    {
      icon: Mail,
      title: "Email",
      content: "support@bookstore.vn",
      subContent: "Phản hồi trong 24h"
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      content: "8:00 - 22:00",
      subContent: "Thứ 2 - Chủ nhật"
    }
  ]

  const faqItems = [
    {
      icon: HelpCircle,
      title: "Câu hỏi thường gặp",
      description: "Tìm câu trả lời nhanh cho các thắc mắc phổ biến",
      link: "/faq"
    },
    {
      icon: FileText,
      title: "Chính sách đổi trả",
      description: "Tìm hiểu về quy trình đổi trả sản phẩm",
      link: "/return-policy"
    },
    {
      icon: MessageSquare,
      title: "Chat trực tuyến",
      description: "Trò chuyện với nhân viên hỗ trợ ngay",
      link: "#"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary transition-colors">
                Trang chủ
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Liên hệ</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi 
              qua các kênh dưới đây hoặc gửi tin nhắn trực tiếp.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl border border-border p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                  <p className="text-foreground">{info.content}</p>
                  <p className="text-sm text-muted-foreground">{info.subContent}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-card rounded-xl border border-border p-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Gửi tin nhắn cho chúng tôi
                </h2>
                <p className="text-muted-foreground mb-6">
                  Điền thông tin bên dưới, chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                </p>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Gửi tin nhắn thành công!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24 giờ.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)}>
                      Gửi tin nhắn khác
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên *</Label>
                        <Input
                          id="name"
                          placeholder="Nguyễn Văn A"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          placeholder="0912 345 678"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Chủ đề *</Label>
                        <Input
                          id="subject"
                          placeholder="Hỗ trợ đơn hàng"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Nội dung tin nhắn *</Label>
                      <Textarea
                        id="message"
                        placeholder="Nhập nội dung tin nhắn của bạn..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">
                            <svg className="h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          </span>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Gửi tin nhắn
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* Map & Additional Info */}
              <div className="space-y-6">
                {/* Map */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15549.260930696782!2d105.8171177503765!3d20.975678950056466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135acef8ad5350f%3A0x89435a3528118ff5!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBUaMSDbmcgTG9uZw!5e1!3m2!1svi!2s!4v1779455185168!5m2!1svi!2s"
                      width="100%"
                      height="100%"
                      style={{ border: 0, position: "absolute", inset: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {faqItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.link}
                      className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow group"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Đăng ký nhận tin
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Nhận thông tin về sách mới, khuyến mãi và các sự kiện đặc biệt từ BookStore
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="flex-1 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Button variant="secondary" type="submit">
                  Đăng ký
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}