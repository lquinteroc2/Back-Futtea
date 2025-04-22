import { Field } from 'src/locations/entities/field.entity';
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

  @ManyToOne(() => Field, field => field.reviews)
  field: Field;
}
