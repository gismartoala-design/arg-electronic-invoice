import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IssuerService } from './issuer.service';
import { CreateIssuerDto, UpdateIssuerDto, IssuerResponseDto } from './dto/issuer.dto';

@ApiTags('Emisores')
@Controller('issuers')
export class IssuerController {
  constructor(private readonly issuerService: IssuerService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo emisor' })
  @ApiResponse({
    status: 201,
    description: 'Emisor creado exitosamente',
    type: IssuerResponseDto,
  })
  @ApiResponse({ status: 409, description: 'El RUC ya está registrado' })
  create(@Body() createIssuerDto: CreateIssuerDto): Promise<IssuerResponseDto> {
    return this.issuerService.create(createIssuerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los emisores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de emisores',
    type: [IssuerResponseDto],
  })
  findAll(): Promise<IssuerResponseDto[]> {
    return this.issuerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener emisor por ID' })
  @ApiResponse({
    status: 200,
    description: 'Emisor encontrado',
    type: IssuerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  findOne(@Param('id') id: string): Promise<IssuerResponseDto> {
    return this.issuerService.findOne(id);
  }

  @Get('ruc/:ruc')
  @ApiOperation({ summary: 'Obtener emisor por RUC' })
  @ApiResponse({
    status: 200,
    description: 'Emisor encontrado',
    type: IssuerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  findByRuc(@Param('ruc') ruc: string): Promise<IssuerResponseDto> {
    return this.issuerService.findByRuc(ruc);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar emisor' })
  @ApiResponse({
    status: 200,
    description: 'Emisor actualizado',
    type: IssuerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateIssuerDto: UpdateIssuerDto,
  ): Promise<IssuerResponseDto> {
    return this.issuerService.update(id, updateIssuerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar emisor' })
  @ApiResponse({ status: 200, description: 'Emisor eliminado' })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.issuerService.remove(id);
  }
}
