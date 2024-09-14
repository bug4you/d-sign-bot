// src/entity/Order.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { eager: true })
    user!: User;

    @Column()
    full_name: string = '';

    @Column()
    phone: string = '';

    @Column({ default: 'pending' })
    status: string = 'pending';

    @CreateDateColumn()
    created_at: Date = new Date();

    @UpdateDateColumn({ nullable: true })
    updated_at: Date = new Date();
}
