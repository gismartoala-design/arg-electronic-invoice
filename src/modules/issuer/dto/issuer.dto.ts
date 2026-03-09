import {
  IsString,
  IsEnum,
  IsBoolean,
  IsEmail,
  IsOptional,
  Length,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AmbienteType } from '../../invoice/entities/enums';

export class CreateIssuerDto {
  @ApiProperty({ description: 'RUC del emisor', example: '1234567890001' })
  @IsString()
  @Length(13, 13)
  ruc: string;

  @ApiProperty({ description: 'Razón social', example: 'EMPRESA EJEMPLO S.A.' })
  @IsString()
  @MaxLength(300)
  razonSocial: string;

  @ApiPropertyOptional({ description: 'Nombre comercial' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  nombreComercial?: string;

  @ApiProperty({ description: 'Dirección matriz' })
  @IsString()
  @MaxLength(500)
  direccionMatriz: string;

  @ApiProperty({
    description: 'Ambiente',
    enum: AmbienteType,
    example: AmbienteType.PRUEBAS,
  })
  @IsEnum(AmbienteType)
  ambiente: AmbienteType;

  @ApiProperty({ description: 'Código de establecimiento', example: '001' })
  @IsString()
  @Length(3, 3)
  establecimiento: string;

  @ApiProperty({ description: 'Código de punto de emisión', example: '001' })
  @IsString()
  @Length(3, 3)
  puntoEmision: string;

  @ApiPropertyOptional({ description: 'Ruta del certificado P12' })
  @IsOptional()
  @IsString()
  certP12Path?: string;

  @ApiPropertyOptional({
    description: 'Contraseña del certificado (encriptada)',
  })
  @IsOptional()
  @IsString()
  certPasswordEncrypted?: string;

  @ApiProperty({ description: 'Obligado a llevar contabilidad', example: true })
  @IsBoolean()
  obligadoContabilidad: boolean;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono' })
  @IsOptional()
  @IsString()
  telefono?: string;
}

export class UpdateIssuerDto {
  @ApiPropertyOptional({ description: 'Razón social' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  razonSocial?: string;

  @ApiPropertyOptional({ description: 'Nombre comercial' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  nombreComercial?: string;

  @ApiPropertyOptional({ description: 'Dirección matriz' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionMatriz?: string;

  @ApiPropertyOptional({ description: 'Ambiente', enum: AmbienteType })
  @IsOptional()
  @IsEnum(AmbienteType)
  ambiente?: AmbienteType;

  @ApiPropertyOptional({ description: 'Código de establecimiento' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  establecimiento?: string;

  @ApiPropertyOptional({ description: 'Código de punto de emisión' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  puntoEmision?: string;

  @ApiPropertyOptional({ description: 'Ruta del certificado P12' })
  @IsOptional()
  @IsString()
  certP12Path?: string;

  @ApiPropertyOptional({ description: 'Contraseña del certificado' })
  @IsOptional()
  @IsString()
  certPasswordEncrypted?: string;

  @ApiPropertyOptional({ description: 'Obligado a llevar contabilidad' })
  @IsOptional()
  @IsBoolean()
  obligadoContabilidad?: boolean;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ description: 'Estado activo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class IssuerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ruc: string;

  @ApiProperty()
  razonSocial: string;

  @ApiPropertyOptional()
  nombreComercial?: string;

  @ApiProperty()
  direccionMatriz: string;

  @ApiProperty({ enum: AmbienteType })
  ambiente: AmbienteType;

  @ApiProperty()
  establecimiento: string;

  @ApiProperty()
  puntoEmision: string;

  @ApiProperty()
  obligadoContabilidad: boolean;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  telefono?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
