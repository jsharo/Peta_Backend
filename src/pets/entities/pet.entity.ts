import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('pet')
export class Pet {
  @PrimaryGeneratedColumn({ name: 'id_pet' })
  id_pet: number;

  @Column({ name: 'name_pet', type: 'varchar', length: 100 })
  name_pet: string;

  @Column({ name: 'species', type: 'varchar', length: 50, nullable: true })
  species?: string;

  @Column({ name: 'race', type: 'varchar', length: 50, nullable: true })
  race?: string;

  @Column({ name: 'sex', type: 'varchar', length: 20, nullable: true })
  sex?: string;

  @Column({ name: 'id_collar', type: 'varchar', length: 50, unique: true })
  id_collar: string;

  @ManyToOne(() => User, user => user.pets)
  @Column({ name: 'id_user', type: 'integer' })
  id_user: number;
}