import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { LogLevels } from 'src/logs/schema/logs.schema';
import { App } from './App';

@Entity({
  name: 'logs',
})
export class Log {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number | string;

  @Column({
    type: 'enum',
    enum: ['unknown', ...Object.values(LogLevels)],
    default: LogLevels.INFO,
  })
  level: string;

  @ManyToOne(() => App)
  app: string | number;

  @Column({ type: 'varchar', length: 1024 })
  text: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  ip?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  tag?: string;
}
