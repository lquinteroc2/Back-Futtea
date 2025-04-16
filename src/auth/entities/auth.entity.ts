import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '../../users/entities/user.entity';

@Entity({ name: 'AUTH_SESSIONS' })
export class AuthSession {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => Users, (user) => user.uuid, { onDelete: 'CASCADE' })
  user: Users;

  @Column({ type: 'text', nullable: false })
  refreshToken: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}