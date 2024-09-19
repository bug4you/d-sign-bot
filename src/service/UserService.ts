import {Repository} from "typeorm";
import {User} from "../entity/User";
import {AppDataSource} from "../data-source";

export class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    async createUser(data: Partial<User>): Promise<User> {
        const user = this.userRepository.create(data);
        return this.userRepository.save(user);
    }

    async getUserById(id: number | undefined): Promise<User | null> {
        return this.userRepository.findOneBy({id});
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.find();
    }

    async updateUser(id: number | undefined, data: Partial<User>): Promise<User | null> {
        // @ts-ignore
        await this.userRepository.update(id, data);
        return this.getUserById(id);
    }

    async deleteUser(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }

    // Tilni yangilash
    async updateUserLanguage(telegramId: number, language: string): Promise<void> {
        const user = await this.userRepository.findOneBy({telegram_id: telegramId.toString()});
        if (user) {
            user.language = language;
            await this.userRepository.save(user);
        }
    }

    // Foydalanuvchini telegram_id orqali olish
    async getUserByTelegramId(telegramId: number | undefined): Promise<User | null> {
        if (!telegramId) {
            return null;
        }
        return this.userRepository.findOneBy({telegram_id: telegramId.toString()});
    }

    // Umumiy foydalanuvchilar sonini olish
    async getUserCount(): Promise<number> {
        return this.userRepository.count();
    }

    // Dizaynerlar sonini olish
    async getDesignerCount(): Promise<number> {
        return this.userRepository.count({where: {role: 'designer'}});
    }
}
