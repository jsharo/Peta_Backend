import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Pet } from '../../pets/entities/pet.entity';

// Enum para roles según la base de datos
export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client'
}

@Entity('user')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn({ name: 'id_user' })
  id_user: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'email', type: 'varchar', length: 100 })
  email: string;

  @Exclude()
  @Column({ name: 'password', type: 'varchar', length: 100, select: false })
  password: string;

  @Column({ name: 'age', type: 'integer', nullable: true })
  age?: number;

  @Column({ name: 'sex', type: 'varchar', length: 20, nullable: true })
  sex?: string;

  @Column({ name: 'rol', type: 'varchar', length: 20, default: UserRole.CLIENT })
  rol: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => Pet, pet => pet.user)
  pets: Pet[];
}