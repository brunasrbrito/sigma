import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;
}
