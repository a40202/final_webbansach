"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const seed_1 = require("../src/data/seed");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.inventoryLog.deleteMany();
    await prisma.book.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    const categorySlugToId = new Map();
    for (const c of seed_1.seedCategories) {
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
    for (const b of seed_1.seedBooks) {
        const categoryId = [...seed_1.seedCategories].find((c) => c.name === b.category)?.id ?? null;
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
    for (const u of seed_1.seedUsers) {
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
                role: u.role,
                isActive: u.isActive ?? true,
                createdAt: new Date(u.createdAt),
            },
        });
    }
    for (const o of seed_1.seedOrders) {
        await prisma.order.create({
            data: {
                id: o.id,
                userId: o.userId,
                totalAmount: o.totalAmount,
                shippingAddress: o.shippingAddress,
                phone: o.phone,
                paymentMethod: o.paymentMethod,
                status: o.status,
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
    for (const r of seed_1.seedReviews) {
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
    for (const log of seed_1.seedInventoryLogs) {
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
//# sourceMappingURL=seed.js.map