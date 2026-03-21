import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
  IsArray,
  Matches,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceDetailTaxDto {
  @ApiProperty({ description: 'Código del impuesto', example: '2' })
  @IsString()
  @MaxLength(2)
  codigo: string;

  @ApiProperty({ description: 'Código porcentaje', example: '4' })
  @IsString()
  @MaxLength(2)
  codigoPorcentaje: string;

  @ApiProperty({ description: 'Tarifa del impuesto', example: 15 })
  @IsNumber()
  @Min(0)
  tarifa: number;

  @ApiProperty({ description: 'Base imponible', example: 100 })
  @IsNumber()
  @Min(0)
  baseImponible: number;

  @ApiProperty({ description: 'Valor del impuesto', example: 15 })
  @IsNumber()
  @Min(0)
  valor: number;
}

export class InvoiceDetailDto {
  @ApiProperty({ description: 'Código principal del producto/servicio' })
  @IsString()
  @MaxLength(50)
  codigoPrincipal: string;

  @ApiPropertyOptional({ description: 'Código auxiliar' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigoAuxiliar?: string;

  @ApiProperty({ description: 'Descripción del producto/servicio' })
  @IsString()
  @MaxLength(500)
  descripcion: string;

  @ApiProperty({ description: 'Cantidad', example: 1 })
  @IsNumber()
  @Min(0)
  cantidad: number;

  @ApiProperty({ description: 'Precio unitario', example: 100 })
  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @ApiProperty({ description: 'Descuento', example: 0 })
  @IsNumber()
  @Min(0)
  descuento: number;

  @ApiProperty({ description: 'Precio total sin impuesto', example: 100 })
  @IsNumber()
  @Min(0)
  precioTotalSinImpuesto: number;

  @ApiPropertyOptional({ description: 'Detalles adicionales' })
  @IsOptional()
  detallesAdicionales?: Record<string, string>;

  @ApiProperty({
    description: 'Impuestos del detalle',
    type: [InvoiceDetailTaxDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceDetailTaxDto)
  impuestos: InvoiceDetailTaxDto[];
}

export class InvoicePaymentDto {
  @ApiProperty({ description: 'Forma de pago', example: '01' })
  @IsString()
  @MaxLength(2)
  formaPago: string;

  @ApiProperty({ description: 'Total', example: 115 })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiPropertyOptional({ description: 'Plazo en días' })
  @IsOptional()
  @IsNumber()
  plazo?: number;

  @ApiPropertyOptional({ description: 'Unidad de tiempo' })
  @IsOptional()
  @IsString()
  unidadTiempo?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'ID del emisor (issuer)' })
  @IsString()
  issuerId: string;

  @ApiProperty({ description: 'Fecha de emisión', example: '28/02/2026' })
  @IsString()
  fechaEmision: string;

  @ApiProperty({
    description: 'Tipo de identificación del cliente',
    example: '04',
  })
  @IsString()
  @MaxLength(2)
  clienteTipoIdentificacion: string;

  @ApiProperty({ description: 'Identificación del cliente' })
  @IsString()
  @MaxLength(20)
  clienteIdentificacion: string;

  @ApiProperty({ description: 'Razón social del cliente' })
  @IsString()
  @MaxLength(300)
  clienteRazonSocial: string;

  @ApiPropertyOptional({ description: 'Dirección del cliente' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  clienteDireccion?: string;

  @ApiPropertyOptional({ description: 'Email del cliente' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  clienteEmail?: string;

  @ApiPropertyOptional({ description: 'Teléfono del cliente' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  clienteTelefono?: string;

  @ApiProperty({ description: 'Total sin impuestos', example: 100 })
  @IsNumber()
  @Min(0)
  totalSinImpuestos: number;

  @ApiPropertyOptional({ description: 'Total descuento', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDescuento?: number;

  @ApiPropertyOptional({ description: 'Propina', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  propina?: number;

  @ApiProperty({ description: 'Importe total', example: 115 })
  @IsNumber()
  @Min(0)
  importeTotal: number;

  @ApiPropertyOptional({ description: 'Moneda', example: 'DOLAR' })
  @IsOptional()
  @IsString()
  moneda?: string;

  @ApiPropertyOptional({ description: 'Información adicional' })
  @IsOptional()
  infoAdicional?: Record<string, string>;

  @ApiProperty({
    description: 'Detalles de la factura',
    type: [InvoiceDetailDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceDetailDto)
  detalles: InvoiceDetailDto[];

  @ApiProperty({ description: 'Formas de pago', type: [InvoicePaymentDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoicePaymentDto)
  pagos: InvoicePaymentDto[];
}

export class IssueInvoiceDto extends CreateInvoiceDto {
  @ApiProperty({
    description: 'Código de establecimiento definido por el ERP/cliente',
    example: '001',
  })
  @IsString()
  @Matches(/^\d{3}$/, {
    message: 'establecimiento debe contener exactamente 3 dígitos numéricos',
  })
  establecimiento: string;

  @ApiProperty({
    description: 'Código de punto de emisión definido por el ERP/cliente',
    example: '002',
  })
  @IsString()
  @Matches(/^\d{3}$/, {
    message: 'puntoEmision debe contener exactamente 3 dígitos numéricos',
  })
  puntoEmision: string;

  @ApiProperty({
    description: 'Secuencial fiscal definido por el ERP/cliente',
    example: '000000123',
  })
  @IsString()
  @Matches(/^\d{1,9}$/, {
    message: 'secuencial debe contener entre 1 y 9 dígitos numéricos',
  })
  secuencial: string;

  @ApiPropertyOptional({
    description:
      'Clave de acceso generada por el ERP/cliente. Si no se envía, el servicio la genera localmente',
    example: '2103202601179141513000110010020000001231234567815',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{49}$/, {
    message: 'claveAcceso debe contener exactamente 49 dígitos numéricos',
  })
  claveAcceso?: string;

  @ApiPropertyOptional({
    description:
      'Si es true o se omite, la factura se registra y luego se autoriza en el mismo flujo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  autorizar?: boolean;
}
