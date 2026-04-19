import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByResetToken(token: string) {
    return this.repo.findOne({ where: { resetToken: token } });
  }

  findAll() {
    return this.repo.find({ relations: ['profile'] });
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    profileId?: number;
    active?: boolean;
  }) {
    const exists = await this.findByEmail(data.email);
    if (exists) throw new ConflictException('Email já cadastrado');

    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.repo.save({
      name: data.name,
      email: data.email,
      passwordHash,
      profileId: data.profileId ?? null,
      active: data.active ?? true,
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      email?: string;
      profileId?: number | null;
      active?: boolean;
    },
  ) {
    const user = await this.findOne(id);

    if (data.email && data.email !== user.email) {
      const exists = await this.findByEmail(data.email);
      if (exists) throw new ConflictException('Email já cadastrado');
    }

    await this.repo.update(id, {
      name: data.name ?? user.name,
      email: data.email ?? user.email,
      profileId: data.profileId !== undefined ? data.profileId : user.profileId,
      active: data.active !== undefined ? data.active : user.active,
    });

    return this.findOne(id);
  }

  async resetPassword(id: number, newPassword: string) {
    const user = await this.findOne(id);
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.repo.remove(user);
    return { message: 'Usuário removido com sucesso' };
  }

  // métodos usados pelo auth
  create_partial(data: Partial<User>) {
    return this.repo.save(data);
  }

  saveResetToken(user: User, token: string, expiry: Date) {
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    return this.repo.save(user);
  }

  clearResetToken(user: User) {
    user.resetToken = null;
    user.resetTokenExpiry = null;
    return this.repo.save(user);
  }

  updatePassword(user: User, passwordHash: string) {
    user.passwordHash = passwordHash;
    return this.repo.save(user);
  }
}
