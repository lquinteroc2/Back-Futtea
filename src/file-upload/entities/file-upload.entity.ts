import { Field } from 'src/locations/entities/field.entity';
import { Location } from 'src/locations/entities/location.entity';
import { Users } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class UploadedImage {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  url: string;
  
  @ManyToOne(() => Users, user => user.images)
  user: Users;

  // Opcionalmente, podrías incluir campos para saber a qué pertenece esta imagen:
  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => Location, (location) => location.images, { onDelete: 'CASCADE' })
  location: Location;
  
  @ManyToOne(() => Field, { nullable: true })
  field?: Field;
}