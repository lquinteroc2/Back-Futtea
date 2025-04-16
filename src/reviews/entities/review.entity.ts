import { Location } from 'src/locations/entities/location.entity';
import { Users } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  canchaName: string;

  @Column()
  comment: string;

  @Column()
  rating: number;

  @ManyToOne(() => Users, user => user.reviews)
  user: Users;

  @ManyToOne(() => Location, location => location.reviews)
 location: Location;
}
