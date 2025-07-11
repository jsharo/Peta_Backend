import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Pet } from '../../pets/entities/pet.entity';

// Definimos el enum de roles
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user' // Cambié 'usuario' a 'user' para mantener consistencia con estándares
}

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
  
  @Exclude()
  @Column({ select: false })
  password: string;

  @Column({ 
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER // Valor por defecto
  })
  role: UserRole; // Usamos 'role' en singular por convención

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Pet, pet => pet.owner)
  pets: Pet[];

  // Método para verificar si el usuario es admin
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}