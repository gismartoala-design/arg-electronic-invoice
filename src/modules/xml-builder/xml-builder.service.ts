import { Injectable } from '@nestjs/common';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

@Injectable()
export class XmlBuilderService {
  private readonly xmlBuilder: XMLBuilder;
  private readonly xmlParser: XMLParser;

  constructor() {
    this.xmlBuilder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      attributeNamePrefix: '@_',
      suppressEmptyNode: true,
    });

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
  }

  buildInvoiceXml(data: any): string {
    const { issuer, invoice, detalles, pagos, infoAdicional } = data;

    // Construir totalConImpuestos (UN SOLO nodo con múltiples totalImpuesto)
    const totalConImpuestos = {
      totalImpuesto: invoice.totalConImpuestos.map((impuesto: any) => ({
        codigo: impuesto.codigo,
        codigoPorcentaje: impuesto.codigoPorcentaje,
        baseImponible: this.formatDecimal(impuesto.baseImponible),
        valor: this.formatDecimal(impuesto.valor),
      })),
    };

    // Construir detalles (UN SOLO nodo <detalles> con múltiples <detalle>)
    const detallesXml = detalles.map((detalle: any) => {
      const impuestos = detalle.impuestos.map((imp: any) => ({
        codigo: imp.codigo,
        codigoPorcentaje: imp.codigoPorcentaje,
        tarifa: this.formatDecimal(imp.tarifa),
        baseImponible: this.formatDecimal(imp.baseImponible),
        valor: this.formatDecimal(imp.valor),
      }));

      const detalleObj: any = {
        codigoPrincipal: detalle.codigoPrincipal,
        descripcion: detalle.descripcion,
        cantidad: this.formatDecimal(detalle.cantidad),
        precioUnitario: this.formatDecimal(detalle.precioUnitario),
        descuento: this.formatDecimal(detalle.descuento),
        precioTotalSinImpuesto: this.formatDecimal(
          detalle.precioTotalSinImpuesto,
        ),
      };

      // TODO: Evaluar si se necesita incluir códigoAuxiliar en el XML, ya que no es un campo obligatorio en la estructura del SRI
      // if (detalle.codigoAuxiliar) {
      //   detalleObj.codigoAuxiliar = detalle.codigoAuxiliar;
      // }

      detalleObj.impuestos = { impuesto: impuestos };

      // Detalles adicionales (UN SOLO nodo <detallesAdicionales> con múltiples <detAdicional>)
      if (
        detalle.detallesAdicionales &&
        Object.keys(detalle.detallesAdicionales).length > 0
      ) {
        detalleObj.detallesAdicionales = {
          detAdicional: Object.entries(detalle.detallesAdicionales).map(
            ([nombre, valor]) => ({
              '@_nombre': nombre,
              '@_valor': valor,
            }),
          ),
        };
      }

      return detalleObj;
    });

    // Construir pagos (UN SOLO nodo <pagos> con múltiples <pago>)
    const pagosXml = pagos.map((pago: any) => {
      const pagoObj: any = {
        formaPago: pago.formaPago,
        total: this.formatDecimal(pago.total),
      };

      if (pago.plazo) {
        pagoObj.plazo = pago.plazo;
        pagoObj.unidadTiempo = pago.unidadTiempo || 'dias';
      }

      return pagoObj;
    });

    // Construir información adicional (UN SOLO nodo con múltiples campoAdicional)
    let infoAdicionalXml: any = null;
    if (infoAdicional && Object.keys(infoAdicional).length > 0) {
      infoAdicionalXml = {
        campoAdicional: Object.entries(infoAdicional).map(
          ([nombre, valor]) => ({
            '@_nombre': nombre,
            '#text': valor,
          }),
        ),
      };
    }

    // Construir estructura principal
    const facturaXml = {
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8',
      },
      factura: {
        '@_id': 'comprobante',
        '@_version': '1.1.0',
        infoTributaria: {
          ambiente: issuer.ambiente,
          tipoEmision: issuer.tipoEmision,
          razonSocial: issuer.razonSocial,
          nombreComercial: issuer.nombreComercial,
          ruc: issuer.ruc,
          claveAcceso: issuer.claveAcceso,
          codDoc: issuer.codDoc,
          estab: issuer.estab,
          ptoEmi: issuer.ptoEmi,
          secuencial: issuer.secuencial,
          dirMatriz: issuer.dirMatriz,
        },
        infoFactura: {
          fechaEmision: invoice.fechaEmision,
          dirEstablecimiento: invoice.dirEstablecimiento,
          obligadoContabilidad: invoice.obligadoContabilidad,
          tipoIdentificacionComprador: invoice.tipoIdentificacionComprador,
          razonSocialComprador: invoice.razonSocialComprador,
          identificacionComprador: invoice.identificacionComprador,
          ...(invoice.direccionComprador && {
            direccionComprador: invoice.direccionComprador,
          }),
          totalSinImpuestos: this.formatDecimal(invoice.totalSinImpuestos),
          totalDescuento: this.formatDecimal(invoice.totalDescuento),
          totalConImpuestos,
          propina: this.formatDecimal(invoice.propina),
          importeTotal: this.formatDecimal(invoice.importeTotal),
          moneda: invoice.moneda,
          pagos: { pago: pagosXml },
        },
        detalles: { detalle: detallesXml },
        ...(infoAdicionalXml && { infoAdicional: infoAdicionalXml }),
      },
    };

    return this.xmlBuilder.build(facturaXml);
  }

  buildCreditNoteXml(creditNoteData: any): string {
    // TODO: Implementar construcción de XML de nota de crédito
    return this.xmlBuilder.build(creditNoteData);
  }

  buildDebitNoteXml(debitNoteData: any): string {
    // TODO: Implementar construcción de XML de nota de débito
    return this.xmlBuilder.build(debitNoteData);
  }

  buildRetentionXml(retentionData: any): string {
    // TODO: Implementar construcción de XML de retención
    return this.xmlBuilder.build(retentionData);
  }

  buildRemissionGuideXml(remissionGuideData: any): string {
    // TODO: Implementar construcción de XML de guía de remisión
    return this.xmlBuilder.build(remissionGuideData);
  }

  parseXml(xmlString: string): any {
    return this.xmlParser.parse(xmlString);
  }

  validateXmlStructure(xmlString: string): boolean {
    // TODO: Implementar validación de estructura XML según XSD del SRI
    try {
      this.xmlParser.parse(xmlString);
      return true;
    } catch (error) {
      return false;
    }
  }

  private formatDecimal(value: number): string {
    return Number(value).toFixed(2);
  }
}
