import { BooksService } from './books.service';
import { QueryBooksDto } from './dto/query-books.dto';
export declare class BooksController {
    private readonly booksService;
    constructor(booksService: BooksService);
    findAll(query: QueryBooksDto): Promise<import("../common/types").Book[]>;
    findFeatured(): Promise<import("../common/types").Book[]>;
    findNewArrivals(): Promise<import("../common/types").Book[]>;
    findBestSellers(): Promise<import("../common/types").Book[]>;
    findOne(id: string): Promise<import("../common/types").Book>;
}
