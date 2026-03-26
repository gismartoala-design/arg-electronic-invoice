import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { ArtifactType } from './entities';
import type { Response } from 'express';
import {
  CreateInvoiceDto,
  IssueInvoiceDto,
  IssueInvoiceResponseDto,
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
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoiceService.create(createInvoiceDto);
  }

  @Post('issue')
  @ApiOperation({
    summary:
      'Recibir factura externa del ERP/POS, firmarla y autorizarla en el SRI',
  })
  @ApiResponse({
    status: 201,
    description:
      'Factura externa registrada y procesada dentro del flujo de autorización fiscal',
    type: IssueInvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  issue(
    @Body() issueInvoiceDto: IssueInvoiceDto,
  ): Promise<IssueInvoiceResponseDto> {
    return this.invoiceService.issue(issueInvoiceDto);
  }

  @Get('by-access-key/:claveAcceso')
  @ApiOperation({
    summary: 'Obtener factura por clave de acceso del ERP/POS o del SRI',
  })
  @ApiResponse({
    status: 200,
    description: 'Factura encontrada por clave de acceso',
    type: IssueInvoiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  findOneByClaveAcceso(
    @Param('claveAcceso') claveAcceso: string,
  ): Promise<IssueInvoiceResponseDto> {
    return this.invoiceService.findOneByClaveAcceso(claveAcceso);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las facturas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de facturas',
    type: PaginatedInvoiceResponseDto,
  })
  @ApiQuery({ type: QueryInvoiceDto })
  findAll(
    @Query() query: QueryInvoiceDto,
  ): Promise<PaginatedInvoiceResponseDto> {
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
  @ApiOperation({
    summary:
      'Obtener un artefacto de la factura (XML, PDF, respuesta SRI) como archivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo descargado exitosamente',
    content: {
      'application/pdf': { schema: { type: 'string', format: 'binary' } },
      'application/xml': { schema: { type: 'string', format: 'binary' } },
      'application/json': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Factura o artefacto no encontrado',
  })
  async getArtifact(
    @Param('id') id: string,
    @Param('type') type: ArtifactType,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { buffer, mimeType, filename } =
      await this.invoiceService.getArtifact(id, type);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(buffer);
  }

  @Get('by-access-key/:claveAcceso/artifacts/:type')
  @ApiOperation({
    summary:
      'Obtener un artefacto de la factura usando la clave de acceso como llave funcional',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo descargado exitosamente',
    content: {
      'application/pdf': { schema: { type: 'string', format: 'binary' } },
      'application/xml': { schema: { type: 'string', format: 'binary' } },
      'application/json': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Factura o artefacto no encontrado',
  })
  async getArtifactByClaveAcceso(
    @Param('claveAcceso') claveAcceso: string,
    @Param('type') type: ArtifactType,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { buffer, mimeType, filename } =
      await this.invoiceService.getArtifactByClaveAcceso(claveAcceso, type);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(buffer);
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
