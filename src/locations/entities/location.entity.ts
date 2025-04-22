import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Field } from './field.entity';
import { Users } from 'src/users/entities/user.entity';
import { UploadedImage } from 'src/file-upload/entities/file-upload.entity';
import { Point } from 'geojson';

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

  @OneToMany(() => UploadedImage, (image) => image.location)
  images: UploadedImage[];

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  coordinates: Point;

  @OneToMany(() => Field, (field) => field.location)
  fields: Field[];

  @ManyToOne(() => Users, (user) => user.ownedLocations)
  admin: Users; // El dueño de la sede
}
