import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  wood_type!: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  scientific_name!: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  common_name!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  height_cm!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  width_cm!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  length_m!: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  unit_volume_m3!: number;

  @Column({ default: true })
  active!: boolean;
}
