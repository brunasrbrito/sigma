import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private repo: Repository<Profile>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const profile = await this.repo.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Perfil não encontrado');
    return profile;
  }

  async create(name: string) {
    const exists = await this.repo.findOne({ where: { name } });
    if (exists) throw new ConflictException('Perfil já existe');
    return this.repo.save({ name });
  }

  async update(id: number, name: string) {
    const profile = await this.findOne(id);
    profile.name = name;
    return this.repo.save(profile);
  }

  async remove(id: number) {
    const profile = await this.findOne(id);
    await this.repo.remove(profile);
    return { message: 'Perfil removido com sucesso' };
  }
}
