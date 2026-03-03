import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DebitNoteService } from './debit-note.service';

@ApiTags('Notas de Débito')
@Controller('debit-notes')
export class DebitNoteController {
  constructor(private readonly debitNoteService: DebitNoteService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva nota de débito' })
  @ApiResponse({ status: 201, description: 'Nota de débito creada exitosamente' })
  create(@Body() createDebitNoteDto: any) {
    return this.debitNoteService.create(createDebitNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las notas de débito' })
  findAll() {
    return this.debitNoteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener nota de débito por ID' })
  findOne(@Param('id') id: string) {
    return this.debitNoteService.findOne(id);
  }
}
