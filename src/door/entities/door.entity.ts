import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('door')
export class Door {
  @PrimaryGeneratedColumn({ name: 'id_door' })
  id_door: number;

  @Column({ name: 'exit', type: 'boolean', default: false })
  exit: boolean;
}