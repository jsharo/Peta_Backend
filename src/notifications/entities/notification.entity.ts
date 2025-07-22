import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  petName: string;

  @Column({ type: 'varchar', length: 50 })
  action: string; // 'entrado' o 'salido'

  @Column({ type: 'varchar', length: 50, nullable: true })
  doorId?: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // NUEVO: Relación con Pet
  @ManyToOne(() => Pet, { eager: true })
  @JoinColumn({ name: 'petId', referencedColumnName: 'id_pet' })
  pet: Pet;

  @Column({ type: 'int', nullable: true })
  petId: number;
}