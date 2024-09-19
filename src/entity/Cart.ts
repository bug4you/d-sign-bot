// src/entity/Cart.ts
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany} from "typeorm";
import {User} from "./User";
import {Design} from "./Design";

@Entity()
export class Cart {
    @PrimaryGeneratedColumn()
    id!: number;

    // @ManyToOne(() => User, {eager: true})
    // user!: User;

    @ManyToOne(() => Design, {eager: true})
    design!: Design;

    @Column({default: 1})
    quantity!: number;

    @CreateDateColumn()
    added_at!: Date;

    @ManyToOne(() => Design, {eager: true}) // Dizayn bilan bog'lash
        // @ts-ignore
    design: Design;

    @ManyToOne(() => User, (user) => user.cartItems, { eager: true }) // Foydalanuvchi bilan bog'lash
    user!: User;
}
