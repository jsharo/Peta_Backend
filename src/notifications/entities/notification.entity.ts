import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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
}