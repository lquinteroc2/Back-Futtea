// match.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Users } from 'src/users/entities/user.entity';
import { Field } from 'src/locations/entities/field.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: '5' | '8' | '11';

  @Column()
  date: string;

  @Column()
  time: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'confirmed' | 'cancelled';

  @ManyToOne(() => Field, (field) => field.id, { nullable: true })
  field?: Field; // Puede o no estar ligada a una cancha real

  @Column()
  maxPlayers: number;

  @Column({ nullable: true })
  password?: string;

  @ManyToOne(() => Users, (user) => user.createdMatches)
  creator: Users;

  @ManyToMany(() => Users)
  @JoinTable()
  players: Users[];


}
