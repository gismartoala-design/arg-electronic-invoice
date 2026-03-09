import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreditNoteService } from './credit-note.service';

@ApiTags('Notas de Crédito')
@Controller('credit-notes')
export class CreditNoteController {
  constructor(private readonly creditNoteService: CreditNoteService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva nota de crédito' })
  @ApiResponse({
    status: 201,
    description: 'Nota de crédito creada exitosamente',
  })
  create(@Body() createCreditNoteDto: any) {
    return this.creditNoteService.create(createCreditNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las notas de crédito' })
  findAll() {
    return this.creditNoteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener nota de crédito por ID' })
  findOne(@Param('id') id: string) {
    return this.creditNoteService.findOne(id);
  }
}
