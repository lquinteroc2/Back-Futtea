import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Users } from 'src/users/entities/user.entity';
import { Location } from 'src/locations/entities/location.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: '5' | '8' | '11'; // tipo de fútbol

  @Column()
  date: string;

  @Column()
  time: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'confirmed' | 'cancelled';
  
  @ManyToOne(() => Location, (location) => location.matches)
  location: Location;

  @Column()
  maxPlayers: number;

  @ManyToOne(() => Users, user => user.createdMatches)
  creator: Users;

  @ManyToMany(() => Users)
  @JoinTable()
  players: Users[];
}
