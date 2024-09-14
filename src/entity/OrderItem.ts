// src/entity/OrderItem.ts
import {Entity, PrimaryGeneratedColumn, ManyToOne, Column} from "typeorm";
import {Order} from "./Order";
import {Design} from "./Design";

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Order, {eager: true})
    order!: Order;

    @ManyToOne(() => Design, {eager: true})
    design!: Design;

    @Column({default: 1})
    quantity: number = 1;
}
