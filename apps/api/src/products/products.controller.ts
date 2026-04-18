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
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      wood_type: string;
      scientific_name?: string;
      common_name?: string;
      height_cm: number;
      width_cm: number;
      length_m: number;
      active?: boolean;
    },
  ) {
    return this.productsService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      wood_type?: string;
      scientific_name?: string;
      common_name?: string;
      height_cm?: number;
      width_cm?: number;
      length_m?: number;
      active?: boolean;
    },
  ) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
