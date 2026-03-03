import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RetentionService } from './retention.service';

@ApiTags('Retenciones')
@Controller('retentions')
export class RetentionController {
  constructor(private readonly retentionService: RetentionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva retención' })
  @ApiResponse({ status: 201, description: 'Retención creada exitosamente' })
  create(@Body() createRetentionDto: any) {
    return this.retentionService.create(createRetentionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las retenciones' })
  findAll() {
    return this.retentionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener retención por ID' })
  findOne(@Param('id') id: string) {
    return this.retentionService.findOne(id);
  }
}
