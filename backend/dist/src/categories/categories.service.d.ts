import type { Category } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
}
