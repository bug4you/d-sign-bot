// src/entity/Category.ts
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name_uz!: string;

    @Column()
    name_ru: string = '';

    @Column()
    name_en: string = '';
}
