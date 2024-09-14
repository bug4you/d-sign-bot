// src/service/CartService.ts
import {Repository} from "typeorm";
import {Cart} from "../entity/Cart";
import {User} from "../entity/User";
import {AppDataSource} from "../data-source";

export class CartService {
    private cartRepository: Repository<Cart>;
    private userRepository: Repository<User>;

    constructor() {
        this.cartRepository = AppDataSource.getRepository(Cart);
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Foydalanuvchi telegram_id si orqali savatchalarni olish
    async getCartsByTelegramId(telegramId: string): Promise<Cart[] | number> {
        const user = await this.userRepository.findOneBy({telegram_id: telegramId});
        if (!user) {
            return 0;
        }

        return this.cartRepository.find({
            where: {user: {id: user.id}},
        });
    }

    // Yangi savatchaga qo'shish metodi
    async addToCart(userId: number, designId: number, quantity: number): Promise<Cart> {
        const cart = this.cartRepository.create({user: {id: userId}, design: {id: designId}, quantity});
        return this.cartRepository.save(cart);
    }

    async getCartById(id: number): Promise<Cart | null> {
        return this.cartRepository.findOneBy({id});
    }

    async getAllCarts(): Promise<Cart[]> {
        return this.cartRepository.find();
    }

    async updateCart(id: number, data: Partial<Cart>): Promise<Cart | null> {
        await this.cartRepository.update(id, data);
        return this.getCartById(id);
    }

    async deleteCart(id: number): Promise<void> {
        await this.cartRepository.delete(id);
    }
}
