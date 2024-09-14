// src/service/CategoryService.ts
import { getRepository, Repository } from "typeorm";
import { Category } from "../entity/Category";

export class CategoryService {
    private categoryRepository: Repository<Category>;

    constructor() {
        this.categoryRepository = getRepository(Category);
    }

    async createCategory(data: Partial<Category>): Promise<Category> {
        const category = this.categoryRepository.create(data);
        return this.categoryRepository.save(category);
    }

    async getCategoryById(id: number): Promise<Category | null> {
        return this.categoryRepository.findOneBy({ id });
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
