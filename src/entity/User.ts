import {Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {Design} from "./Design";
import {Cart} from "./Cart";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique: true})
    telegram_id!: string;

    @Column()
    first_name!: string;

    @Column({nullable: true})
    last_name?: string = '';

    @Column({nullable: true})
    username?: string = '';

    @Column({nullable: true})
    phone?: string = '';

    @Column({nullable: false})
    role: string | 'user' | 'admin' | 'designer' = 'user';

    @Column({default: 'uz'})
    language!: string;

    @Column({default: false})
    is_designer!: boolean;

    // Dizaynlar bilan bog'lash
    @OneToMany(() => Design, (design) => design.designer)
    designs!: Design[];

    // Savatcha yozuvlari bilan bog'lash
    @OneToMany(() => Cart, (cart) => cart.user)
    cartItems!: Cart[];  // Foydalanuvchining savatchadagi dizaynlari

    @Column({nullable: true, update: false})
    @CreateDateColumn()
    created_at?: Date;

    @Column({nullable: true})
    @UpdateDateColumn()
    updated_at?: Date;
}
