// src/entity/Design.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Design {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { eager: true })
    designer!: User;

    @Column()
    title_uz!: string;

    @Column()
    title_ru!: string;

    @Column()
    title_en!: string;

    @Column({ nullable: true })
    description_uz!: string;

    @Column({ nullable: true })
    description_ru!: string;

    @Column({ nullable: true })
    description_en!: string;

    @Column("float")
    price!: number;

    @Column({ default: 'pending' })
    status!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn({ nullable: true })
    updated_at!: Date;
}
