import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Match } from 'src/matches/entities/match.entity';
import { Review } from 'src/reviews/entities/review.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  coordinates: string; // Podrías guardar lat/lng como JSON o string

  @OneToMany(() => Match, (match) => match.location)
  matches: Match[];

  @OneToMany(() => Review, (review) => review.location)
  reviews: Review[];
}
