// src/service/CategoryService.ts
import {Repository} from "typeorm";
import {Category} from "../entity/Category";
import {AppDataSource} from "../data-source";

export class CategoryService {
    private categoryRepository: Repository<Category>;

    constructor() {
        this.categoryRepository = AppDataSource.getRepository(Category);
    }

    async isCategoryNameTaken(name_uz: string): Promise<boolean> {
        // @ts-ignore
        const category = await this.categoryRepository.findOne({where: {name_uz}});
        return !!category;  // Kategoriya mavjud bo'lsa true qaytaradi
    }

    async createCategory(data: Partial<Category>): Promise<Category> {
        const category = this.categoryRepository.create(data);
        return this.categoryRepository.save(category);
    }

    async getCategoryById(id: number): Promise<Category | null> {
        return this.categoryRepository.findOneBy({id});
    }

    async getAllCategories(): Promise<Category[]> {
        return this.categoryRepository.find();
    }

    async updateCategory(id: number, data: Partial<Category>): Promise<Category | null> {
        await this.categoryRepository.update(id, data);
        return this.getCategoryById(id);
    }

    async deleteCategory(id: number): Promise<void> {
        await this.categoryRepository.delete(id);
    }
}
