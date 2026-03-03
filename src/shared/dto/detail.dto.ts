import { IsString, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DetailDto {
  @ApiProperty({ description: 'Código principal del producto/servicio' })
  @IsString()
  codigoPrincipal: string;

  @ApiPropertyOptional({ description: 'Código auxiliar' })
  @IsOptional()
  @IsString()
  codigoAuxiliar?: string;

  @ApiProperty({ description: 'Descripción del producto/servicio' })
  @IsString()
  descripcion: string;

  @ApiProperty({ description: 'Cantidad', example: 1 })
  @IsNumber()
  @Min(0)
  cantidad: number;

  @ApiProperty({ description: 'Precio unitario' })
  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @ApiProperty({ description: 'Descuento', example: 0 })
  @IsNumber()
  @Min(0)
  descuento: number;

  @ApiProperty({ description: 'Precio total sin impuestos' })
  @IsNumber()
  @Min(0)
  precioTotalSinImpuesto: number;

  @ApiPropertyOptional({ description: 'Detalle adicional' })
  @IsOptional()
  @IsString()
  detalleAdicional?: string;
}
