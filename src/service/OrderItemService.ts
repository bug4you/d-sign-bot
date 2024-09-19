// src/service/OrderItemService.ts
import { Repository } from "typeorm";
import { OrderItem } from "../entity/OrderItem";
import { Order } from "../entity/Order";
import { Design } from "../entity/Design";
import { AppDataSource } from "../data-source";

export class OrderItemService {
    private orderItemRepository: Repository<OrderItem>;

    constructor() {
        this.orderItemRepository = AppDataSource.getRepository(OrderItem);
    }

    // 1. Yangi buyurtma elementini yaratish (dizayn qo'shish)
    async createOrderItem(order: Order, design: Design, quantity: number): Promise<OrderItem> {
        const orderItem = this.orderItemRepository.create({ order, design, quantity });
        return this.orderItemRepository.save(orderItem);
    }

    // 2. Buyurtma bo'yicha barcha elementlarni olish (biror buyurtmaning tarkibidagi dizaynlar)
    async getOrderItemsByOrder(orderId: number): Promise<OrderItem[]> {
        return this.orderItemRepository.find({
            where: { order: { id: orderId } },
            relations: ["order", "design"], // Bog'langan buyurtma va dizaynni yuklash
        });
    }

    // 3. Buyurtma elementini yangilash (masalan, sonini o'zgartirish)
    async updateOrderItem(id: number, quantity: number): Promise<OrderItem | null> {
        const orderItem = await this.orderItemRepository.findOne({ where: { id } });
        if (!orderItem) return null;

        orderItem.quantity = quantity;
        return this.orderItemRepository.save(orderItem);
    }

    // 4. Buyurtma elementini o'chirish
    async deleteOrderItem(id: number): Promise<void> {
        await this.orderItemRepository.delete(id);
    }

    // 5. Foydalanuvchining buyurtma elementlarini olish (foydalanuvchi tomonidan buyurtma qilingan dizaynlar)
    async getOrderItemsByUser(userId: number): Promise<OrderItem[]> {
        return this.orderItemRepository.find({
            where: { order: { user: { id: userId } } },
            relations: ["order", "design"],
        });
    }

    // 6. Buyurtmadagi dizaynlarni umumiy narxini hisoblash
    async calculateTotalPrice(orderId: number): Promise<number> {
        const orderItems = await this.getOrderItemsByOrder(orderId);
        let totalPrice = 0;

        orderItems.forEach((item) => {
            const designPrice = parseFloat(item.design.price);
            totalPrice += designPrice * item.quantity;
        });

        return totalPrice;
    }
}
