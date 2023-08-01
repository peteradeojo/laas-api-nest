import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity({
  name: 'apps',
})
export class App {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number | string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  token?: string;

  @ManyToOne(() => User, { eager: true })
  // @JoinColumn()
  user?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
