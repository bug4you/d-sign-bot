// src/service/DesignerRequestService.ts
import {getRepository, Repository} from "typeorm";
import {DesignerRequest} from "../entity/DesignerRequest";
import {User} from "../entity/User";

export class DesignerRequestService {
    private designerRequestRepository: Repository<DesignerRequest>;

    constructor() {
        this.designerRequestRepository = getRepository(DesignerRequest);
    }

    async createRequest(user: User, bio: string): Promise<DesignerRequest> {
        const request = this.designerRequestRepository.create({user, bio});
        return this.designerRequestRepository.save(request);
    }

    async getRequestById(id: number): Promise<DesignerRequest | null> {
        return this.designerRequestRepository.findOneBy({id});
    }

    async getAllRequests(): Promise<DesignerRequest[]> {
        return this.designerRequestRepository.find();
    }

    async updateRequest(id: number, data: Partial<DesignerRequest>): Promise<DesignerRequest | null> {
        await this.designerRequestRepository.update(id, data);
        return this.getRequestById(id);
    }

    async deleteRequest(id: number): Promise<void> {
        await this.designerRequestRepository.delete(id);
    }
}
