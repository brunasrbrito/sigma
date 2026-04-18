import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../profiles/profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'varchar', nullable: true, default: null })
  resetToken!: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  resetTokenExpiry!: Date | null;

  @ManyToOne(() => Profile, { nullable: true, eager: true })
  @JoinColumn({ name: 'profileId' })
  profile!: Profile | null;

  @Column({ nullable: true })
  profileId!: number | null;
}
