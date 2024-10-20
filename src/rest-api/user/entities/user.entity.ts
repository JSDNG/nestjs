import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Role } from "../../role/entities/role.entity";

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    username?: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    imgName?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column()
    isActive: boolean;

    @Column()
    codeId: string;

    @Column()
    codeExpired: Date;

    @Column({ nullable: true, type: 'varchar', length: 255 })
    refreshToken?: string;

    @ManyToOne(() => Role, role => role.users)
    role: Role;

    @Column()
    roleId: number; 

    @CreateDateColumn()
    createdAt: Date; 

    @UpdateDateColumn()
    updatedAt: Date;
}
