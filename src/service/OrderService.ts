// src/service/OrderService.ts
import { Repository } from "typeorm";
import { Order } from "../entity/Order";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";

export class OrderService {
    private orderRepository: Repository<Order>;

    constructor() {
        this.orderRepository = AppDataSource.getRepository(Order);
    }

    // Umumiy buyurtmalar sonini olish
    async getOrderCount(): Promise<number> {
        return this.orderRepository.count();
    }

    // 1. Yangi buyurtma yaratish
    async createOrder(user: User, fullName: string, phone: string): Promise<Order> {
        const order = this.orderRepository.create({ user, full_name: fullName, phone });
        return this.orderRepository.save(order);
    }

    // 2. Buyurtmani ID bo'yicha olish
    async getOrderById(id: number): Promise<Order | null> {
        return this.orderRepository.findOne({
            where: { id },
            relations: ["user"], // Foydalanuvchi bilan bog'liq ma'lumotni yuklash
        });
    }

    // 3. Foydalanuvchining barcha buyurtmalarini olish
    async getUserOrders(userId: number): Promise<Order[]> {
        return this.orderRepository.find({
            where: { user: { id: userId } },
            relations: ["user"],
            order: { created_at: "DESC" },
        });
    }

    // 4. Barcha buyurtmalarni olish
    async getAllOrders(): Promise<Order[]> {
        return this.orderRepository.find({
            relations: ["user"], // Foydalanuvchi bilan bog'liq ma'lumotni yuklash
            order: { created_at: "DESC" },
        });
    }

    // 5. Buyurtma holatini yangilash
    async updateOrderStatus(id: number, status: string): Promise<Order | null> {
        await this.orderRepository.update(id, { status });
        return this.getOrderById(id);
    }

    // 6. Buyurtmani yangilash (ma'lumotlarni o'zgartirish)
    async updateOrder(id: number, data: Partial<Order>): Promise<Order | null> {
        await this.orderRepository.update(id, data);
        return this.getOrderById(id);
    }

    // 7. Buyurtmani o'chirish
    async deleteOrder(id: number): Promise<void> {
        await this.orderRepository.delete(id);
    }

    // 8. Foydalanuvchining mavjud bo'lgan buyurtmalarni tekshirish
    async hasActiveOrders(userId: number): Promise<boolean> {
        const activeOrderCount = await this.orderRepository.count({
            where: { user: { id: userId }, status: "pending" },
        });
        return activeOrderCount > 0;
    }
}
