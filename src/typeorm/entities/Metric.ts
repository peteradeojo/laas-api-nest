import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { App } from './App';

@Entity()
export class Metric {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => App)
  app: App;

  @Column({
    type: 'enum',
    enum: ['info', 'warn', 'error', 'debug', 'fatal', 'unknown'],
  })
  level: string;

  @Column({ type: 'int', default: 0 })
  weight: number;

  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  saveDate: Date;
}
