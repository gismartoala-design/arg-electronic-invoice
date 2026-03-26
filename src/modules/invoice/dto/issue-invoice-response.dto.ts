import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceResponseDto } from './invoice-response.dto';

export class IssueInvoiceArtifactsDto {
  @ApiPropertyOptional({
    description:
      'URL para descargar el XML firmado generado durante el flujo de autorización',
  })
  signedXmlUrl?: string;

  @ApiPropertyOptional({
    description:
      'URL para descargar el XML autorizado devuelto por el SRI cuando exista',
  })
  authorizedXmlUrl?: string;
}

export class IssueInvoiceResponseDto extends InvoiceResponseDto {
  @ApiPropertyOptional({
    type: IssueInvoiceArtifactsDto,
    description:
      'Artefactos fiscales disponibles para consumo del ERP/POS una vez procesado el documento',
  })
  artifacts?: IssueInvoiceArtifactsDto;
}
