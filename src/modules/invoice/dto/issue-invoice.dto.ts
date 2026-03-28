import { IsEnum, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateInvoiceDto } from './create-invoice.dto';
import { AmbienteType } from '../entities';

export class IssueInvoiceDto extends CreateInvoiceDto {
  @ApiProperty({
    description: 'Ambiente SRI del documento definido por el ERP/POS',
    enum: AmbienteType,
    example: AmbienteType.PRUEBAS,
  })
  @IsEnum(AmbienteType, {
    message: 'ambiente debe ser PRUEBAS o PRODUCCION',
  })
  ambiente: AmbienteType;

  @ApiProperty({
    description:
      'Código de establecimiento definido por el ERP/POS para el documento fiscal',
    example: '001',
  })
  @IsString()
  @Matches(/^\d{3}$/, {
    message: 'establecimiento debe contener exactamente 3 dígitos numéricos',
  })
  establecimiento: string;

  @ApiProperty({
    description:
      'Código de punto de emisión definido por el ERP/POS para el documento fiscal',
    example: '002',
  })
  @IsString()
  @Matches(/^\d{3}$/, {
    message: 'puntoEmision debe contener exactamente 3 dígitos numéricos',
  })
  puntoEmision: string;

  @ApiProperty({
    description: 'Secuencial fiscal generado externamente por el ERP/POS',
    example: '000000123',
  })
  @IsString()
  @Matches(/^\d{1,9}$/, {
    message: 'secuencial debe contener entre 1 y 9 dígitos numéricos',
  })
  secuencial: string;

  @ApiProperty({
    description:
      'Clave de acceso generada por el ERP/POS. Es la llave funcional del flujo externo',
    example: '2103202601179141513000110010020000001231234567815',
  })
  @IsString()
  @Matches(/^\d{49}$/, {
    message: 'claveAcceso debe contener exactamente 49 dígitos numéricos',
  })
  claveAcceso: string;
}
