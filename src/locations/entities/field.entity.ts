import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
  } from 'typeorm';
  import { Location } from './location.entity';

  import { Review } from 'src/reviews/entities/review.entity';
import { Schedule } from './schelude.entity';
import { UploadedImage } from 'src/file-upload/entities/file-upload.entity';
  
  @Entity()
  export class Field {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string;
  
    @Column()
    type: '5' | '8' | '11';
  
    @ManyToOne(() => Location, (location) => location.fields)
    location: Location;

    @OneToMany(() => UploadedImage, (image) => image.field)
    images: UploadedImage[];
  
    @OneToMany(() => Schedule, (schedule) => schedule.field)
    schedules: Schedule[];
  
    @OneToMany(() => Review, (review) => review.field)
    reviews: Review[];
  }
  