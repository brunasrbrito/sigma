import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      profileId?: number;
      active?: boolean;
    },
  ) {
    return this.usersService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      email?: string;
      profileId?: number;
      active?: boolean;
    },
  ) {
    return this.usersService.update(id, body);
  }

  @Put(':id/reset-password')
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.resetPassword(id, newPassword);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
