import { Credential } from 'src/auth/entities/credential.entity';
import { UploadedImage } from 'src/file-upload/entities/file-upload.entity';
import { Match } from 'src/matches/entities/match.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Review } from 'src/reviews/entities/review.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum Role {
  SUPERADMIN= "superAdmin",
  ADMIN = "admin",
  USER = "user",
}

@Entity({
  name: 'USERS',
})
export class Users {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  country: string;

  @Column({
    type: 'text',
  })
  address: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  city: string;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: false,
  })
  user_name: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({
    type: 'boolean',
    default: false,
  })
  isVerified: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  verificationCodeExpiresAt: Date;

  @Column({ type: 'varchar', nullable: true })
  verificationCode: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  profileImage: string;

  @Column({ type: 'boolean', default: false })
  banned: boolean; // NUEVO: Indica si el usuario está baneado
  

  @OneToMany(() => Credential, (cred) => cred.user)
  credentials: Credential[];


  @OneToMany(() => Notification, (notification) => notification.user, { cascade: true })
  notifications: Notification[];

  @OneToMany(() => UploadedImage, (image) => image.user, { cascade: true })
  images: UploadedImage[];

  @OneToMany(() => Match, (match) => match.creator)
  createdMatches: Match[];

  @ManyToMany(() => Match, (match) => match.players)
  joinedMatches: Match[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}