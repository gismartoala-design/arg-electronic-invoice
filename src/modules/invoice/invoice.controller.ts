import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { ArtifactType } from './entities';
import {
  CreateInvoiceDto,
  QueryInvoiceDto,
  InvoiceResponseDto,
  PaginatedInvoiceResponseDto,
} from './dto';

@ApiTags('Facturas')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva factura electrónica' })
  @ApiResponse({
    status: 201,
    description: 'Factura creada exitosamente',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    return this.invoiceService.create(createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las facturas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de facturas',
    type: PaginatedInvoiceResponseDto,
  })
  @ApiQuery({ type: QueryInvoiceDto })
  findAll(@Query() query: QueryInvoiceDto): Promise<PaginatedInvoiceResponseDto> {
    return this.invoiceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener factura por ID' })
  @ApiResponse({
    status: 200,
    description: 'Factura encontrada',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  findOne(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.invoiceService.findOne(id);
  }

  @Get(':id/artifacts/:type')
  @ApiOperation({ summary: 'Obtener un artefacto de la factura (XML, PDF, respuesta SRI)' })
  @ApiResponse({
    status: 200,
    description: 'Artefacto encontrado',
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Contenido del artefacto (texto o base64 para PDFs)' },
        mimeType: { type: 'string', description: 'Tipo MIME del contenido' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Factura o artefacto no encontrado' })
  getArtifact(
    @Param('id') id: string,
    @Param('type') type: ArtifactType,
  ): Promise<{ content: string; mimeType: string }> {
    return this.invoiceService.getArtifact(id, type);
  }

  @Post(':id/authorize')
  @ApiOperation({ summary: 'Firmar y autorizar factura en el SRI' })
  @ApiResponse({
    status: 200,
    description: 'Proceso de autorización iniciado',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Error en autorización' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  authorize(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.invoiceService.authorize(id);
  }

  @Post(':id/check-authorization')
  @ApiOperation({ summary: 'Consultar estado de autorización en el SRI' })
  @ApiResponse({
    status: 200,
    description: 'Estado de autorización consultado',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  checkAuthorization(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.invoiceService.checkAuthorization(id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Reintentar autorización de factura' })
  @ApiResponse({
    status: 200,
    description: 'Reintento iniciado',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'No se puede reintentar' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  retry(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.invoiceService.retry(id);
  }
}
