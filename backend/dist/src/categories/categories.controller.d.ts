import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<import("../common/types").Category[]>;
    findOne(id: string): Promise<import("../common/types").Category>;
}
