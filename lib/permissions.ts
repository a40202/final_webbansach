export const PERMISSION_KEYS = [
  'dashboard',
  'books',
  'categories',
  'inventory',
  'orders',
  'returns',
  'invoices',
  'promotions',
  'articles',
  'users',
  'support',
  'reports',
  'view_revenue',
] as const

export type PermissionKey = (typeof PERMISSION_KEYS)[number]

/** Quyền mặc định nhân viên — dùng khi session cũ chưa có permissions */
export const DEFAULT_STAFF_PERMISSIONS: PermissionKey[] = [
  'dashboard',
  'books',
  'categories',
  'inventory',
  'orders',
  'returns',
  'invoices',
  'articles',
  'support',
]

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  dashboard: 'Dashboard',
  books: 'Quản lý sách',
  categories: 'Quản lý danh mục',
  inventory: 'Quản lý kho',
  orders: 'Quản lý đơn hàng',
  returns: 'Trả hàng',
  invoices: 'Hóa đơn',
  promotions: 'Khuyến mãi',
  articles: 'Quản lý bài viết',
  users: 'Quản lý người dùng',
  support: 'Hỗ trợ khách hàng',
  reports: 'Thống kê báo cáo',
  view_revenue: 'Xem doanh thu',
}

export function getEffectivePermissions(
  user: { role: string; permissions?: string[] } | null | undefined,
): PermissionKey[] | undefined {
  if (!user) return undefined
  if (user.role === 'admin') return [...PERMISSION_KEYS]
  if (user.role !== 'staff') return undefined
  if (user.permissions && user.permissions.length > 0) {
    return user.permissions.filter((p): p is PermissionKey =>
      (PERMISSION_KEYS as readonly string[]).includes(p),
    )
  }
  return [...DEFAULT_STAFF_PERMISSIONS]
}

export function hasPermission(
  user: { role: string; permissions?: string[] } | null | undefined,
  permission: PermissionKey,
): boolean {
  const perms = getEffectivePermissions(user)
  if (!perms) return false
  return perms.includes(permission)
}

export function staffPermissionsLoaded(
  user: { role: string; permissions?: string[] } | null | undefined,
): boolean {
  if (!user || user.role !== 'staff') return true
  return Boolean(user.permissions && user.permissions.length > 0)
}

export function canAccessAdmin(
  user: { role: string } | null | undefined,
): boolean {
  return user?.role === 'admin' || user?.role === 'staff'
}
