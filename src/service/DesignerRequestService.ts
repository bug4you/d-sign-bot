// src/service/DesignerRequestService.ts
import {Repository} from "typeorm";
import {DesignerRequest} from "../entity/DesignerRequest";
import {User} from "../entity/User";
import {AppDataSource} from "../data-source";

export class DesignerRequestService {
    private designerRequestRepository: Repository<DesignerRequest>;

    constructor() {
        this.designerRequestRepository = AppDataSource.getRepository(DesignerRequest);
    }

    async createRequest(user: User, bio: string, passport: string): Promise<DesignerRequest> {
        const request = this.designerRequestRepository.create({
            user,          // Foydalanuvchi obyektini kiritamiz
            bio,           // Dizayner so'rovi uchun biografiya (foydalanuvchi ma'lumotlari)
            passport,      // Passport fayl yo'li yoki ID
            status: 'pending'
        });
        return this.designerRequestRepository.save(request);
    }

    // Tasdiqlanmagan so'rovlarni olish
    async getPendingRequests(): Promise<DesignerRequest[]> {
        return this.designerRequestRepository.find({
            where: {status: 'pending'}
        });
    }

    // Tasdiqlash (so'rovni approved holatiga o'tkazish)
    async approveRequest(requestId: number): Promise<void> {
        const request = await this.designerRequestRepository.findOne({where: {id: requestId}});
        if (request) {
            request.status = 'approved';
            await this.designerRequestRepository.save(request);

            // Foydalanuvchini dizayner sifatida yangilash
            request.user.is_designer = true;
            request.user.role = 'designer';
            await AppDataSource.getRepository(User).save(request.user);
        }
    }

    // Rad etish (so'rovni declined holatiga o'tkazish)
    async declineRequest(requestId: number): Promise<void> {
        const request = await this.designerRequestRepository.findOne({where: {id: requestId}});
        if (request) {
            request.status = 'declined';
            await this.designerRequestRepository.save(request);
        }
    }

    // Admin rad qiladi
    async rejectRequest(id: number): Promise<void> {
        await this.designerRequestRepository.update(id, {status: 'rejected'});
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
