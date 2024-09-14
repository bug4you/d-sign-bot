// src/entity/Cart.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Design } from "./Design";

@Entity()
export class Cart {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { eager: true })
    user!: User;

    @ManyToOne(() => Design, { eager: true })
    design!: Design;

    @Column({ default: 1 })
    quantity!: number;

    @CreateDateColumn()
    added_at!: Date;
}
