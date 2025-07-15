import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Pet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  species: string; // Especie (perro, gato, etc.)

  @Column()
  breed: string; // Raza

  @Column()
  age: number;

  @Column()
  sex: string; // Sexo (Macho/Hembra)

  @ManyToOne(() => User, user => user.pets)
  owner: User; // Relación con el dueño
}