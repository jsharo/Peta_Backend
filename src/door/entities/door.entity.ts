import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('door')
export class Door {
  @PrimaryGeneratedColumn({ name: 'id_door' })
  id_door: number;

  @Column({ name: 'exit', type: 'boolean', default: false })
  exit: boolean;

  @Column({ name: 'is_locked', type: 'boolean', default: false })
  is_locked: boolean;

  @Column({ name: 'esp32_id', type: 'varchar', nullable: false })
  esp32_id: string; 
}