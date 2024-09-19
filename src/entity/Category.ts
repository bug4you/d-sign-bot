// src/entity/Category.ts
import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {Design} from "./Design";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name_uz!: string;

    @Column()
    name_ru?: string = '';

    @Column()
    name_en?: string = '';

    // Dizaynlar bilan bog'lash
    @OneToMany(() => Design, (design) => design.category)
    designs!: Design[];
}
