import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('doors')
export class Door {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  esp32Id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastStatusChange: Date;
}