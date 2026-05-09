import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Supplier } from '../suppliers/supplier.entity';
import { User } from '../users/user.entity';
import { LotItem } from './lot-item.entity';

@Entity('lots')
export class Lot {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  dofNumber!: string;

  @ManyToOne(() => Supplier, { eager: true, nullable: false })
  @JoinColumn({ name: 'supplierId' })
  supplier!: Supplier;

  @Column()
  supplierId!: number;

  @Column({ type: 'date' })
  entryDate!: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy!: User | null;

  @Column({ nullable: true })
  createdById!: number | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @OneToMany(() => LotItem, (item) => item.lot, {
    cascade: true,
  })
  items!: LotItem[];
}
