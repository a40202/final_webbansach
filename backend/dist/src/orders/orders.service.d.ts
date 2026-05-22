import type { Order, OrderStatus as OrderStatusType, PublicUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private nextOrderId;
    findAll(user: PublicUser, userId?: string): Promise<Order[]>;
    findOne(id: string, user: PublicUser): Promise<Order>;
    create(userId: string, dto: CreateOrderDto): Promise<Order>;
    updateStatus(id: string, status: OrderStatusType, user: PublicUser): Promise<Order>;
}
