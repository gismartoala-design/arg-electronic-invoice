import { IsString, IsEmail, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { REGEX_PATTERNS } from '../constants/sri.constants';

export class AddressDto {
  @ApiProperty({ description: 'Dirección principal' })
  @IsString()
  direccion: string;

  @ApiPropertyOptional({ description: 'Ciudad' })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiPropertyOptional({ description: 'Provincia' })
  @IsOptional()
  @IsString()
  provincia?: string;

  @ApiPropertyOptional({ description: 'País' })
  @IsOptional()
  @IsString()
  pais?: string;
}

export class ClientDto {
  @ApiProperty({ description: 'Tipo de identificación', example: '04' })
  @IsString()
  tipoIdentificacion: string;

  @ApiProperty({ description: 'Número de identificación' })
  @IsString()
  @Matches(REGEX_PATTERNS.NUMERIC)
  numeroIdentificacion: string;

  @ApiProperty({ description: 'Razón social o nombre del cliente' })
  @IsString()
  razonSocial: string;

  @ApiPropertyOptional({ description: 'Dirección del cliente' })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({ description: 'Email del cliente' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono del cliente' })
  @IsOptional()
  @IsString()
  telefono?: string;
}

export class TaxDto {
  @ApiProperty({ description: 'Código del impuesto', example: '2' })
  @IsString()
  codigo: string;

  @ApiProperty({ description: 'Código porcentaje', example: '2' })
  @IsString()
  codigoPorcentaje: string;

  @ApiProperty({ description: 'Tarifa', example: 12 })
  tarifa: number;

  @ApiProperty({ description: 'Base imponible' })
  baseImponible: number;

  @ApiProperty({ description: 'Valor del impuesto' })
  valor: number;
}

export class PaymentDto {
  @ApiProperty({ description: 'Forma de pago', example: '01' })
  @IsString()
  formaPago: string;

  @ApiProperty({ description: 'Total a pagar' })
  total: number;

  @ApiPropertyOptional({ description: 'Plazo en días' })
  @IsOptional()
  plazo?: number;

  @ApiPropertyOptional({ description: 'Unidad de tiempo' })
  @IsOptional()
  @IsString()
  unidadTiempo?: string;
}
