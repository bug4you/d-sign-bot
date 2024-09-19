import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {User} from "./User";
import {Category} from "./Category";
import {StatusType} from "../utils/StatusType"; // Kategoriya modeli

@Entity()
export class Design {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({nullable: false})
    title_uz!: string;

    @Column({nullable: true})
    title_ru?: string;

    @Column({nullable: true})
    title_en?: string;

    @Column({nullable: false})
    description_uz!: string;

    @Column({nullable: true})
    description_ru?: string;

    @Column({nullable: true})
    description_en?: string;

    @Column({nullable: false})
    price!: string;

    @Column({nullable: false})
    image!: string;

    @Column({nullable: false, default: 'pending'})
    status!: StatusType;

    // Foydalanuvchi bilan bog'lash (designer)
    @ManyToOne(() => User, (user) => user.designs, {eager: true}) // `eager: true` bilan bog'liq ma'lumotlarni avtomatik yuklash
    designer!: User;

    // Kategoriya bilan bog'lash
    @ManyToOne(() => Category, (category) => category.designs, {eager: true}) // Kategoriyani avtomatik yuklash
    category!: Category;

    @CreateDateColumn()
    created_at?: Date;

    @UpdateDateColumn()
    updated_at?: Date;
}
