// src/service/DesignService.ts
import {Repository} from "typeorm";
import {Design} from "../entity/Design";
import {User} from "../entity/User";
import {AppDataSource} from "../data-source";

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
        return this.designRepository.findOneBy({id});
    }

    async getAllDesigns(): Promise<Design[]> {
        return this.designRepository.find();
    }

    async updateDesign(id: number, data: Partial<Design>): Promise<Design | null> {
        await this.designRepository.update(id, data);
        return this.getDesignById(id);
    }

    async deleteDesign(id: number): Promise<void> {
        await this.designRepository.delete(id);
    }

    async getDesignsByDesigner(designer: User): Promise<Design[]> {
        // @ts-ignore
        return this.designRepository.find({designer});
    }

    async getDesignsByStatus(status: string): Promise<Design[]> {
        // @ts-ignore
        return this.designRepository.find({status});
    }
}
