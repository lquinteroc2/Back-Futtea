import { Users } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'NOTIFICATIONS' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'text', nullable: false })
  message: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Users, (user) => user.notifications, { onDelete: 'CASCADE' })
  user: Users;
}