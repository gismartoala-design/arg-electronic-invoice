import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  InvoiceStatus,
  SriReceptionStatus,
  SriAuthorizationStatus,
} from '../entities/enums';

export class InvoiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  issuerId: string;

  @ApiProperty()
  secuencial: string;

  @ApiProperty()
  establecimiento: string;

  @ApiProperty()
  puntoEmision: string;

  @ApiPropertyOptional()
  claveAcceso?: string;

  @ApiProperty()
  fechaEmision: string;

  @ApiProperty()
  clienteTipoIdentificacion: string;

  @ApiProperty()
  clienteIdentificacion: string;

  @ApiProperty()
  clienteRazonSocial: string;

  @ApiPropertyOptional()
  clienteDireccion?: string;

  @ApiPropertyOptional()
  clienteEmail?: string;

  @ApiPropertyOptional()
  clienteTelefono?: string;

  @ApiProperty()
  totalSinImpuestos: number;

  @ApiProperty()
  totalDescuento: number;

  @ApiProperty()
  propina: number;

  @ApiProperty()
  importeTotal: number;

  @ApiProperty()
  moneda: string;

  @ApiProperty({ enum: InvoiceStatus })
  status: InvoiceStatus;

  @ApiPropertyOptional({ enum: SriReceptionStatus })
  sriReceptionStatus?: SriReceptionStatus;

  @ApiPropertyOptional({ enum: SriAuthorizationStatus })
  sriAuthorizationStatus?: SriAuthorizationStatus;

  @ApiPropertyOptional()
  authorizationNumber?: string;

  @ApiPropertyOptional()
  authorizedAt?: Date;

  @ApiProperty()
  retryCount: number;

  @ApiPropertyOptional()
  lastError?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  detalles?: any[];

  @ApiPropertyOptional()
  pagos?: any[];

  @ApiPropertyOptional()
  infoAdicional?: Record<string, string>;
}

export class PaginatedInvoiceResponseDto {
  @ApiProperty({ type: [InvoiceResponseDto] })
  data: InvoiceResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
