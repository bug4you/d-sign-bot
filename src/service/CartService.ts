import {Repository} from "typeorm";
import {Cart} from "../entity/Cart";
import {User} from "../entity/User";
import {Design} from "../entity/Design";
import {AppDataSource} from "../data-source";
import consola from "consola"; // AppDataSource TypeORM DataSource

export class CartService {
    private cartRepository: Repository<Cart>;
    private designRepository: Repository<Design>;
    private userRepository: Repository<User>;

    constructor() {
        this.cartRepository = AppDataSource.getRepository(Cart);
        this.designRepository = AppDataSource.getRepository(Design);
        this.userRepository = AppDataSource.getRepository(User);
    }

    // 1. Dizaynni savatchaga qo'shish
    async addToCart(userId: string, designId: number, quantity: number = 1): Promise<Cart> {
        const user = await this.userRepository.findOne({where: {telegram_id: userId}});
        const design = await this.designRepository.findOne({where: {id: designId}});

        if (!user || !design) {
            consola.error(`User: ${user}, Design: ${design}`);
            throw new Error("User or Design not found");
        }
        consola.success(`User: ${user.first_name}, Design: ${design.title_uz}`);
        let cartItem = await this.cartRepository.findOne({where: {user: {id: user.id}, design: {id: designId}}});

        if (cartItem) {
            // Agar savatchada dizayn mavjud bo'lsa, miqdorini yangilaymiz
            cartItem.quantity += quantity;
            consola.success(`Cart item quantity updated: ${cartItem.quantity}`);
        } else {
            // Yangi yozuv yaratamiz
            cartItem = this.cartRepository.create({
                user,
                design,
                quantity
            });
        }

        return this.cartRepository.save(cartItem);
    }

    // 2. Foydalanuvchining savatchasini ko'rish
    async getUserCart(userId: string): Promise<Cart[]> {
        let user = await this.userRepository.findOneBy({telegram_id: userId});
        return this.cartRepository.find({
            where: {user: {id: user?.id}}, // Foydalanuvchining savatchasi
            relations: ["design", "user"], // Bog'liq ma'lumotlarni yuklash
        });
    }

    // 3. Savatchadan dizaynni olib tashlash
    async removeFromCart(userId: string, designId: number): Promise<void> {
        const cartItem = await this.cartRepository.findOne({
            where: {
                user: {telegram_id: userId},
                design: {id: designId}
            }
        });

        if (!cartItem) {
            throw new Error("Cart item not found");
        }

        await this.cartRepository.remove(cartItem);
    }

    // 4. Foydalanuvchining savatchasini tozalash
    async clearUserCart(userId: string): Promise<void> {
        const cartItems = await this.cartRepository.find({where: {user: {telegram_id: userId}}});
        if (cartItems.length > 0) {
            await this.cartRepository.remove(cartItems);
        }
    }

    // 5. Savatchadagi elementning miqdorini yangilash
    async updateCartItemQuantity(userId: number, designId: number, newQuantity: number): Promise<Cart> {
        const cartItem = await this.cartRepository.findOne({where: {user: {id: userId}, design: {id: designId}}});

        if (!cartItem) {
            throw new Error("Cart item not found");
        }

        cartItem.quantity = newQuantity;
        return this.cartRepository.save(cartItem);
    }
}
