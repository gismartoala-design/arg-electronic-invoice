import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  InvoiceStatus,
  SriReceptionStatus,
  SriAuthorizationStatus,
} from '../entities/enums';

export class QueryInvoiceDto {
  @ApiPropertyOptional({ description: 'Emisor ID' })
  @IsOptional()
  @IsString()
  issuerId?: string;

  @ApiPropertyOptional({
    description: 'Estado de la factura',
    enum: InvoiceStatus,
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({
    description: 'Estado de recepción SRI',
    enum: SriReceptionStatus,
  })
  @IsOptional()
  @IsEnum(SriReceptionStatus)
  sriReceptionStatus?: SriReceptionStatus;

  @ApiPropertyOptional({
    description: 'Estado de autorización SRI',
    enum: SriAuthorizationStatus,
  })
  @IsOptional()
  @IsEnum(SriAuthorizationStatus)
  sriAuthorizationStatus?: SriAuthorizationStatus;

  @ApiPropertyOptional({ description: 'Identificación del cliente' })
  @IsOptional()
  @IsString()
  clienteIdentificacion?: string;

  @ApiPropertyOptional({ description: 'Fecha inicio', example: '01/02/2026' })
  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha fin', example: '28/02/2026' })
  @IsOptional()
  @IsString()
  fechaFin?: string;

  @ApiPropertyOptional({ description: 'Página', example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}
