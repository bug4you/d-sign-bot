// src/service/OrderItemService.ts
import { getRepository, Repository } from "typeorm";
import { OrderItem } from "../entity/OrderItem";

export class OrderItemService {
    private orderItemRepository: Repository<OrderItem>;

    constructor() {
        this.orderItemRepository = getRepository(OrderItem);
    }

    async addItem(orderId: number, designId: number, quantity: number): Promise<OrderItem> {
        const orderItem = this.orderItemRepository.create({ order: { id: orderId }, design: { id: designId }, quantity });
        return this.orderItemRepository.save(orderItem);
    }

    async getOrderItemById(id: number): Promise<OrderItem | null> {
        return this.orderItemRepository.findOneBy({ id });
    }

    async getAllOrderItems(): Promise<OrderItem[]> {
        return this.orderItemRepository.find();
    }

    async updateOrderItem(id: number, data: Partial<OrderItem>): Promise<OrderItem | null> {
        await this.orderItemRepository.update(id, data);
        return this.getOrderItemById(id);
    }

    async deleteOrderItem(id: number): Promise<void> {
        await this.orderItemRepository.delete(id);
    }
}
