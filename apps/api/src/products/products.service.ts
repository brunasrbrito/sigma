import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
  ) {}

  private calcVolume(
    height_cm: number,
    width_cm: number,
    length_m: number,
  ): number {
    return parseFloat(((height_cm * width_cm * length_m) / 10000).toFixed(6));
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  create(data: {
    wood_type: string;
    scientific_name?: string;
    common_name?: string;
    height_cm: number;
    width_cm: number;
    length_m: number;
    active?: boolean;
  }) {
    const unit_volume_m3 = this.calcVolume(
      data.height_cm,
      data.width_cm,
      data.length_m,
    );
    return this.repo.save({
      ...data,
      unit_volume_m3,
      active: data.active ?? true,
    });
  }

  async update(
    id: number,
    data: {
      wood_type?: string;
      scientific_name?: string;
      common_name?: string;
      height_cm?: number;
      width_cm?: number;
      length_m?: number;
      active?: boolean;
    },
  ) {
    const product = await this.findOne(id);

    const height = data.height_cm ?? Number(product.height_cm);
    const width = data.width_cm ?? Number(product.width_cm);
    const length = data.length_m ?? Number(product.length_m);
    const unit_volume_m3 = this.calcVolume(height, width, length);

    await this.repo.update(id, { ...data, unit_volume_m3 });
    return this.findOne(id);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.repo.remove(product);
    return { message: 'Produto removido com sucesso' };
  }
}
