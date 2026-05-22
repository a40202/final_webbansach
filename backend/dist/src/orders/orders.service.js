"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const mappers_1 = require("../common/mappers");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async nextOrderId() {
        const orders = await this.prisma.order.findMany({
            select: { id: true },
        });
        const nums = orders
            .map((o) => Number(o.id.replace('ORD', '')) || 0)
            .filter((n) => !Number.isNaN(n));
        const next = (nums.length ? Math.max(...nums) : 0) + 1;
        return `ORD${String(next).padStart(3, '0')}`;
    }
    async findAll(user, userId) {
        const isStaff = user.role === 'admin' || user.role === 'staff';
        const where = isStaff && userId
            ? { userId }
            : isStaff
                ? {}
                : { userId: user.id };
        const rows = await this.prisma.order.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map(mappers_1.mapOrder);
    }
    async findOne(id, user) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        const isStaff = user.role === 'admin' || user.role === 'staff';
        if (!isStaff && order.userId !== user.id) {
            throw new common_1.ForbiddenException('Khong co quyen xem don hang nay');
        }
        return (0, mappers_1.mapOrder)(order);
    }
    async create(userId, dto) {
        const orderItems = [];
        for (const item of dto.items) {
            const book = await this.prisma.book.findUnique({
                where: { id: item.bookId },
            });
            if (!book) {
                throw new common_1.BadRequestException(`Book ${item.bookId} not found`);
            }
            if (book.stock < item.quantity) {
                throw new common_1.BadRequestException(`Book "${book.title}" het hang`);
            }
            orderItems.push({
                bookId: item.bookId,
                quantity: item.quantity,
                price: book.price,
            });
        }
        const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const shippingFee = dto.shippingFee ?? (subtotal >= 300000 ? 0 : 30000);
        const totalAmount = subtotal + shippingFee;
        const orderId = await this.nextOrderId();
        const order = await this.prisma.$transaction(async (tx) => {
            for (const item of orderItems) {
                await tx.book.update({
                    where: { id: item.bookId },
                    data: { stock: { decrement: item.quantity } },
                });
            }
            return tx.order.create({
                data: {
                    id: orderId,
                    userId,
                    totalAmount,
                    shippingAddress: dto.shippingAddress,
                    phone: dto.phone,
                    paymentMethod: dto.paymentMethod,
                    status: client_1.OrderStatus.pending,
                    items: {
                        create: orderItems,
                    },
                },
                include: { items: true },
            });
        });
        return (0, mappers_1.mapOrder)(order);
    }
    async updateStatus(id, status, user) {
        if (user.role !== 'admin' && user.role !== 'staff') {
            throw new common_1.ForbiddenException('Chi admin/staff moi cap nhat trang thai');
        }
        const order = await this.prisma.order.update({
            where: { id },
            data: { status: status },
            include: { items: true },
        });
        return (0, mappers_1.mapOrder)(order);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map