// src/service/DesignService.ts
import {Repository} from "typeorm";
import {Design} from "../entity/Design";
import {User} from "../entity/User";
import {Category} from "../entity/Category";
import {AppDataSource} from "../data-source";
import {StatusType} from "../utils/StatusType";

export class DesignService {
    private designRepository: Repository<Design>;

    constructor() {
        this.designRepository = AppDataSource.getRepository(Design);
    }

    async createDesign(designer: User, data: Partial<Design>): Promise<Design> {
        const design = this.designRepository.create({designer, ...data});
        return this.designRepository.save(design);
    }

    async getDesignById(id: number): Promise<Design | null> {
        return this.designRepository.findOne({
            where: {id},
            relations: ["designer", "category"], // Foydalanuvchi va kategoriyani yuklash
        });
    }

    async getDesignByIdAndDesignerId(id: number, designerId: number): Promise<Design | null> {
        return this.designRepository.findOne({
            where: {id, designer: {id: designerId}},
            relations: ["designer", "category"], // Foydalanuvchi va kategoriyani yuklash
        });
    }

    async getAllDesigns(): Promise<Design[]> {
        return this.designRepository.find({relations: ["designer", "category"]});
    }

    async getDesignsByStatus(status: StatusType): Promise<Design[]> {
        return this.designRepository.find({
            where: {status},
            relations: ["designer", "category"],
        });
    }

    async getUserApprovedDesigns(userId: number): Promise<Design[]> {
        // Foydalanuvchining "approved" statusidagi barcha dizaynlarini qaytarish
        return this.designRepository.find({
            where: {
                status: "approved",
                designer: {
                    id: userId
                }
            },
            relations: ["designer", "category"], // Bog'liq ma'lumotlar yuklash
            order: {
                created_at: "DESC" // Oxirgi dizaynlarni birinchi ko'rsatish
            }
        });
    }

    async getAllApprovedDesigns(): Promise<Design[]> {
        return await this.designRepository.find({
            where: {
                status: "approved"
            }
        })
    }

    async getAllPendingDesigns(): Promise<Design[]> {
        return await this.designRepository.find({
            where: {
                status: "pending"
            }
        })
    }

    async getUserPendingDesigns(userId: number): Promise<Design[]> {
        // Foydalanuvchining "pending" statusidagi barcha dizaynlarini qaytarish
        return this.designRepository.find({
            where: {
                status: "pending",
                designer: {
                    id: userId
                }
            },
            relations: ["designer", "category"], // Bog'liq ma'lumotlar yuklash
            order: {
                created_at: "DESC" // Oxirgi dizaynlarni birinchi ko'rsatish
            }
        });
    }

    async getApprovedDesignsPaginated(offset: number, limit: number = 1): Promise<Design[]> {
        return this.designRepository.find({
            where: {status: "approved"}, // Faqat "approved" dizaynlar
            skip: offset,  // Sahifani o'tkazib yuborish
            take: limit,   // Ko'rsatish kerak bo'lgan dizaynlar soni
            relations: ["designer", "category"], // Bog'liq ma'lumotlar yuklash
            order: {
                created_at: "DESC" // Oxirgi dizaynlarni birinchi ko'rsatish
            }
        });
    }

    async getCountOfApprovedDesigns(): Promise<number> {
        return this.designRepository.count({
            where: {status: "approved"} // Faqat "approved" dizaynlar
        });
    }

    async getCountDesigns(): Promise<number> {
        return this.designRepository.count();
    }

    async getDesignsByCategoryWithPaginated(category: Category, offset: number, limit: number = 1): Promise<Design[]> {
        return this.designRepository.find({
            where: {status: "approved", category}, // "approved" dizaynlar va kategoriya bo'yicha filtr
            skip: offset,
            take: limit,
            relations: ["designer", "category"],
            order: {
                created_at: "DESC"
            }
        });
    }

    async getCountOfDesignsByCategory(category: Category): Promise<number> {
        return this.designRepository.count({
            where: {status: "approved", category}
        });
    }

    async getDesignsByDesigner(designer: User): Promise<Design[]> {
        return this.designRepository.find({
            where: {designer},
            relations: ["designer", "category"],
        });
    }

    async updateDesign(id: number, data: Partial<Design>): Promise<Design | null> {
        await this.designRepository.update(id, data);
        return this.getDesignById(id);
    }

    async updateDesignStatus(id: number, status: StatusType): Promise<Design | null> {
        return this.updateDesign(id, {status});
    }

    async updateDesignPrice(id: number, price: string): Promise<Design | null> {
        return this.updateDesign(id, {price});
    }

    async deleteDesign(id: number): Promise<void> {
        await this.designRepository.delete(id);
    }
}
