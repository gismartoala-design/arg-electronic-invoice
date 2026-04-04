import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceResponseDto } from './invoice-response.dto';

export class IssueInvoiceArtifactsDto {
  @ApiPropertyOptional({
    description:
      'Contenido XML fiscal disponible para integración. Prioriza el XML autorizado y, si aún no existe, devuelve el XML firmado',
  })
  xml?: string;

  @ApiPropertyOptional({
    description:
      'Tipo de XML devuelto en el campo xml: XML_AUTHORIZED o XML_SIGNED',
  })
  xmlType?: string;

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
