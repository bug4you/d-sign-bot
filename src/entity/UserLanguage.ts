// src/entity/UserLanguage.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class UserLanguage {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { eager: true })
    user: User= new User();

    @Column({ default: 'uz' })
    language: string = 'uz';
}
