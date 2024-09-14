// src/entity/User.ts
import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    first_name: string = '';

    @Column({nullable: true})
    last_name: string = '';

    @Column({nullable: true})
    username: string = '';

    @Column()
    phone: string = '';

    @Column({unique: true})
    telegram_id: string = '';

    @Column({default: 'user'})
    role: string = 'user';

    @Column({default: 'uz'})
    language: string = 'uz';

    @Column({default: 0})
    is_designer: boolean = false;

    @CreateDateColumn()
    created_at: Date = new Date();

    @UpdateDateColumn({nullable: true})
    updated_at: Date = new Date();
}
