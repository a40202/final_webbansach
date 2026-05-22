# Bookstore API (NestJS + PostgreSQL + JWT)

Base URL: `http://localhost:3001/api`

## Authentication

Đăng nhập / đăng ký trả về:

```json
{
  "user": { "id", "email", "fullName", "role", ... },
  "accessToken": "eyJhbG..."
}
```

Gửi token cho các route bảo vệ:

```
Authorization: Bearer <accessToken>
```

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| POST | `/auth/login` | — | Đăng nhập |
| POST | `/auth/register` | — | Đăng ký |
| GET | `/auth/me` | JWT | Thông tin user hiện tại |
| PATCH | `/auth/profile` | JWT | Cập nhật hồ sơ |

## Books (public)

| Method | Path |
|--------|------|
| GET | `/books` |
| GET | `/books/featured` |
| GET | `/books/new-arrivals` |
| GET | `/books/best-sellers` |
| GET | `/books/:id` |

## Categories (public)

| Method | Path |
|--------|------|
| GET | `/categories` |
| GET | `/categories/:id` |

## Orders (JWT)

| Method | Path | Ghi chú |
|--------|------|---------|
| GET | `/orders` | Khách: đơn của mình; Admin: tất cả (có thể `?userId=`) |
| GET | `/orders/:id` | |
| POST | `/orders` | Tạo đơn (userId lấy từ JWT) |
| PATCH | `/orders/:id/status` | Admin/Staff only |

## Reviews (public)

| Method | Path |
|--------|------|
| GET | `/reviews?bookId=` |

## Users (JWT + Admin)

| Method | Path |
|--------|------|
| GET | `/users` |
| PATCH | `/users/:id/active` |
