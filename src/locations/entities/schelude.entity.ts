import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
  } from 'typeorm';
  import { Field } from './field.entity';
  
  @Entity()
  export class Schedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    date: string; // ISO date format
  
    @Column()
    startTime: string; // ej: "18:00"
  
    @Column()
    endTime: string;   // ej: "19:00"
  
    @Column({ default: true })
    isAvailable: boolean;
  
    @ManyToOne(() => Field, (field) => field.schedules)
    field: Field;
  }
  