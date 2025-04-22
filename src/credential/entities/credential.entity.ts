import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from 'src/users/entities/user.entity';

export enum CredentialType {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple'
  // puedes agregar más
}

@Entity({ name: 'CREDENTIALS' })
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => Users, (user) => user.credentials, { onDelete: 'CASCADE' })
  user: Users;

  @Column({ type: 'enum', enum: CredentialType })
  type: CredentialType;

  @Column({ type: 'text', nullable: false })
  identifier: string; // puede ser email, googleId, etc

  @Column({ type: 'text', nullable: true })
  secretHash: string; // solo para LOCAL

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
