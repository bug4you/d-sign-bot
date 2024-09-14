// src/entity/DesignerRequest.ts
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class DesignerRequest {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, {eager: true})
    user!: User;

    @Column({nullable: true})
    bio!: string;

    @Column({default: 'pending'})
    status!: string;

    @CreateDateColumn()
    created_at!: Date;
}
