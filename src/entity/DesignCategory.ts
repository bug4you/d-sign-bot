// src/entity/DesignCategory.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Design } from "./Design";
import { Category } from "./Category";

@Entity()
export class DesignCategory {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Design, { eager: true })
    design!: Design;

    @ManyToOne(() => Category, { eager: true })
    category!: Category;
}
