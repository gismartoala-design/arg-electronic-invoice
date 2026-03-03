import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RemissionGuideService } from './remission-guide.service';

@ApiTags('Guías de Remisión')
@Controller('remission-guides')
export class RemissionGuideController {
  constructor(private readonly remissionGuideService: RemissionGuideService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva guía de remisión' })
  @ApiResponse({ status: 201, description: 'Guía de remisión creada exitosamente' })
  create(@Body() createRemissionGuideDto: any) {
    return this.remissionGuideService.create(createRemissionGuideDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las guías de remisión' })
  findAll() {
    return this.remissionGuideService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener guía de remisión por ID' })
  findOne(@Param('id') id: string) {
    return this.remissionGuideService.findOne(id);
  }
}
