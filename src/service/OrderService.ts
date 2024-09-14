// src/service/OrderService.ts
import {Repository} from "typeorm";
import {Order} from "../entity/Order";
import {User} from "../entity/User";
import {AppDataSource} from "../data-source";

export class OrderService {
    private orderRepository: Repository<Order>;

    constructor() {
        this.orderRepository = AppDataSource.getRepository(Order);
    }

    // Umumiy buyurtmalar sonini olish
    async getOrderCount(): Promise<number> {
        return this.orderRepository.count();
    }

    async createOrder(user: User, fullName: string, phone: string): Promise<Order> {
        const order = this.orderRepository.create({ user, full_name: fullName, phone });
        return this.orderRepository.save(order);
    }

    async getOrderById(id: number): Promise<Order | null> {
        return this.orderRepository.findOneBy({ id });
    }

    async getAllOrders(): Promise<Order[]> {
        return this.orderRepository.find();
    }

    async updateOrder(id: number, data: Partial<Order>): Promise<Order | null> {
        await this.orderRepository.update(id, data);
        return this.getOrderById(id);
    }

    async deleteOrder(id: number): Promise<void> {
        await this.orderRepository.delete(id);
    }
}
