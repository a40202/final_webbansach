import { PrismaClient, Role, OrderStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  seedBooks,
  seedCategories,
  seedInventoryLogs,
  seedOrders,
  seedReviews,
  seedUsers,
} from '../src/data/seed';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categorySlugToId = new Map<string, string>();
  for (const c of seedCategories) {
    await prisma.category.create({
      data: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        bookCount: c.bookCount,
      },
    });
    categorySlugToId.set(c.slug, c.id);
    categorySlugToId.set(c.name, c.id);
  }

  for (const b of seedBooks) {
    const categoryId =
      [...seedCategories].find((c) => c.name === b.category)?.id ?? null;
    await prisma.book.create({
      data: {
        id: b.id,
        title: b.title,
        author: b.author,
        price: b.price,
        originalPrice: b.originalPrice ?? null,
        description: b.description,
        coverImage: b.coverImage,
        category: b.category,
        categoryId,
        publisher: b.publisher,
        publishYear: b.publishYear,
        pages: b.pages,
        language: b.language,
        isbn: b.isbn,
        stock: b.stock,
        soldCount: b.soldCount ?? null,
        rating: b.rating,
        reviewCount: b.reviewCount,
        isFeatured: b.isFeatured ?? false,
        isNewArrival: b.isNewArrival ?? false,
        isBestSeller: b.isBestSeller ?? false,
      },
    });
  }

  for (const u of seedUsers) {
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        password: hashed,
        fullName: u.fullName,
        name: u.name ?? u.fullName,
        phone: u.phone,
        address: u.address,
        role: u.role as Role,
        isActive: u.isActive ?? true,
        createdAt: new Date(u.createdAt),
      },
    });
  }

  for (const o of seedOrders) {
    await prisma.order.create({
      data: {
        id: o.id,
        userId: o.userId,
        totalAmount: o.totalAmount,
        shippingAddress: o.shippingAddress,
        phone: o.phone,
        paymentMethod: o.paymentMethod as PaymentMethod,
        status: o.status as OrderStatus,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
        items: {
          create: o.items.map((item) => ({
            bookId: item.bookId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }

  for (const r of seedReviews) {
    await prisma.review.create({
      data: {
        id: r.id,
        bookId: r.bookId,
        userId: r.userId,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        createdAt: new Date(r.createdAt),
      },
    });
  }

  for (const log of seedInventoryLogs) {
    await prisma.inventoryLog.create({
      data: {
        id: log.id,
        bookId: log.bookId,
        type: log.type,
        quantity: log.quantity,
        note: log.note,
        createdAt: new Date(log.createdAt),
        createdBy: log.createdBy,
      },
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
