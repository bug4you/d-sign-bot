// src/entity/Order.ts
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {User} from "./User";

export type OrderStatus = 'pending' | 'completed' | 'canceled' | 'processing' | string;

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, {eager: true})
    user!: User;

    @Column()
    full_name: string = '';

    @Column()
    phone: string = '';

    @Column({default: 'pending'})
    status: OrderStatus = 'pending';

    @CreateDateColumn()
    created_at: Date = new Date();

    @UpdateDateColumn({nullable: true})
    updated_at: Date = new Date();
}
