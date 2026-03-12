import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  Invoice,
  InvoiceDetail,
  InvoiceDetailTax,
  InvoicePayment,
  InvoiceArtifact,
  InvoiceEvent,
  Issuer,
  InvoiceStatus,
  SriReceptionStatus,
  SriAuthorizationStatus,
  ArtifactType,
  InvoiceEventType,
  AmbienteType,
} from './entities';
import {
  CreateInvoiceDto,
  QueryInvoiceDto,
  InvoiceResponseDto,
  PaginatedInvoiceResponseDto,
} from './dto';
import { XmlBuilderService } from '../xml-builder/xml-builder.service';
import { SignatureService } from '../signature/signature.service';
import { SriService } from '../sri/sri.service';
import { StorageService } from '../storage/storage.service';
import {
  generateAccessKey,
  generateNumericCode,
  validateAccessKey,
} from '../../shared/utils/access-key.util';
import {
  formatDateForSri,
  getCurrentDateForSri,
} from '../../shared/utils/date.util';
import {
  TipoComprobante,
  TipoEmision,
} from '../../shared/constants/sri.constants';
import { PdfGeneratorService } from '../pdf-generator/pdf-generator.service';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceDetail)
    private readonly detailRepository: Repository<InvoiceDetail>,
    @InjectRepository(InvoiceDetailTax)
    private readonly detailTaxRepository: Repository<InvoiceDetailTax>,
    @InjectRepository(InvoicePayment)
    private readonly paymentRepository: Repository<InvoicePayment>,
    @InjectRepository(InvoiceArtifact)
    private readonly artifactRepository: Repository<InvoiceArtifact>,
    @InjectRepository(InvoiceEvent)
    private readonly eventRepository: Repository<InvoiceEvent>,
    @InjectRepository(Issuer)
    private readonly issuerRepository: Repository<Issuer>,
    private readonly xmlBuilderService: XmlBuilderService,
    private readonly signatureService: SignatureService,
    private readonly sriService: SriService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  /**
   * Crear una nueva factura
   */
  async create(
    createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    this.logger.log(
      `Creating invoice for issuer: ${createInvoiceDto.issuerId}`,
    );

    // Validar que el emisor exista
    const issuer = await this.issuerRepository.findOne({
      where: { id: createInvoiceDto.issuerId, isActive: true },
    });

    if (!issuer) {
      throw new NotFoundException('Emisor no encontrado');
    }

    // Generar secuencial
    const secuencial = await this.generateSecuencial(issuer.id);

    // Validar totales antes de crear
    this.validateInvoiceTotals(createInvoiceDto);

    const { detalles, pagos, ...invoicePayload } = createInvoiceDto;

    // Crear la factura
    const invoice = this.invoiceRepository.create({
      ...invoicePayload,
      secuencial,
      status: InvoiceStatus.DRAFT,
      moneda: createInvoiceDto.moneda || 'DOLAR',
      totalDescuento: createInvoiceDto.totalDescuento || 0,
      propina: createInvoiceDto.propina || 0,
    });

    // Guardar la factura
    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Guardar detalles
    for (const detalleDto of detalles) {
      const { impuestos, ...detallePayload } = detalleDto;
      const detalle = this.detailRepository.create({
        ...detallePayload,
        invoiceId: savedInvoice.id,
      });
      await this.detailRepository.save(detalle);

      // Guardar impuestos del detalle
      for (const impuestoDto of impuestos) {
        const impuesto = this.detailTaxRepository.create({
          ...impuestoDto,
          detailId: detalle.id,
        });
        await this.detailTaxRepository.save(impuesto);
      }
    }

    // Guardar pagos
    for (const pagoDto of pagos) {
      const pago = this.paymentRepository.create({
        ...pagoDto,
        invoiceId: savedInvoice.id,
      });
      await this.paymentRepository.save(pago);
    }

    // Registrar evento de creación
    await this.createEvent(
      savedInvoice.id,
      InvoiceEventType.CREATED,
      'Factura creada',
    );

    this.logger.log(`Invoice created with ID: ${savedInvoice.id}`);

    return this.mapToResponseDto(savedInvoice);
  }

  /**
   * Listar todas las facturas con filtros
   */
  async findAll(query: QueryInvoiceDto): Promise<PaginatedInvoiceResponseDto> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Invoice> = {};

    if (filters.issuerId) where.issuerId = filters.issuerId;
    if (filters.status) where.status = filters.status;
    if (filters.sriReceptionStatus)
      where.sriReceptionStatus = filters.sriReceptionStatus;
    if (filters.sriAuthorizationStatus)
      where.sriAuthorizationStatus = filters.sriAuthorizationStatus;
    if (filters.clienteIdentificacion)
      where.clienteIdentificacion = filters.clienteIdentificacion;

    if (filters.fechaInicio && filters.fechaFin) {
      where.fechaEmision = Between(filters.fechaInicio, filters.fechaFin);
    }

    const [invoices, total] = await this.invoiceRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['detalles', 'pagos'],
    });

    return {
      data: invoices.map((inv) => this.mapToResponseDto(inv)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener una factura por ID
   */
  async findOne(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['detalles', 'detalles.impuestos', 'pagos', 'issuer'],
    });

    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    return this.mapToResponseDto(invoice);
  }

  /**
   * Obtener un artefacto (XML, PDF, respuesta SRI) de una factura
   */
  async getArtifact(
    invoiceId: string,
    type: ArtifactType,
  ): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
    if (type === ArtifactType.RIDE_PDF) {
      // Para RIDE, buscamos el XML_AUTHORIZED y generamos el PDF al vuelo
      const xmlArtifact = await this.artifactRepository.findOne({
        where: { invoiceId, type: ArtifactType.XML_AUTHORIZED },
      });

      if (!xmlArtifact || (!xmlArtifact.content && !xmlArtifact.storageKey)) {
        throw new NotFoundException(
          `Factura ${invoiceId} no cuenta a\u00fan con un XML autorizado para generar el RIDE`,
        );
      }

      const invoice = await this.invoiceRepository.findOne({ where: { id: invoiceId } });

      let xmlContent = xmlArtifact.content;
      if (!xmlContent && xmlArtifact.storageKey) {
        const fileBuffer = await this.storageService.get(xmlArtifact.storageKey);
        xmlContent = fileBuffer.toString('utf8');
      }

      const buffer = await this.pdfGeneratorService.generateRideFromXml(
        xmlContent,
        {
          numeroAutorizacion: invoice?.authorizationNumber,
          fechaAutorizacion: invoice?.authorizedAt,
        }
      );

      return {
        buffer,
        mimeType: 'application/pdf',
        filename: `${invoiceId}_RIDE.pdf`,
      };
    }

    // Para otros tipos de artefactos
    const artifact = await this.artifactRepository.findOne({
      where: { invoiceId, type },
    });

    if (!artifact) {
      throw new NotFoundException(
        `Artefacto ${type} no encontrado para factura ${invoiceId}`,
      );
    }

    let buffer: Buffer;

    if (artifact.content) {
      // XML, JSON: est\u00e1 en la columna content de la DB
      buffer = Buffer.from(artifact.content, 'utf8');
    } else if (artifact.storageKey) {
      // PDF (por si hubieran PDFs hist\u00f3ricos): est\u00e1 en Cloud Storage
      buffer = await this.storageService.get(artifact.storageKey);
    } else {
      throw new InternalServerErrorException(
        `Artefacto ${type} no tiene contenido ni storageKey`,
      );
    }

    // Determinar extensi\u00f3n basado en el mimeType o el ArtifactType
    let extension = 'dat';
    if (artifact.mimeType === 'application/xml' || type.includes('XML')) {
      extension = 'xml';
    } else if (
      artifact.mimeType === 'application/json' ||
      type.includes('RESPONSE')
    ) {
      extension = 'json';
    }

    return {
      buffer,
      mimeType: artifact.mimeType,
      filename: `${invoiceId}_${type}.${extension}`,
    };
  }

  /**
   * Firmar y enviar factura al SRI
   */
  async authorize(id: string): Promise<InvoiceResponseDto> {
    this.logger.log(`Authorizing invoice: ${id}`);

    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['detalles', 'detalles.impuestos', 'pagos', 'issuer'],
    });

    this.logger.debug('=== FACTURA OBTENIDA PARA AUTORIZACIÓN ===');
    this.logger.debug(invoice);
    this.logger.debug('=== FIN FACTURA OBTENIDA ===');

    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    if (invoice.status === InvoiceStatus.AUTHORIZED) {
      throw new BadRequestException('La factura ya está autorizada');
    }

    this.validateInvoiceEntityTotals(invoice);

    try {
      // Paso 1: Generar clave de acceso si no existe
      if (!invoice.claveAcceso) {
        invoice.claveAcceso = await this.generateClaveAcceso(invoice);
        await this.invoiceRepository.save(invoice);
      }

      // Paso 2: Generar XML
      const xmlUnsigned = await this.generateXml(invoice);
      this.logger.debug('=== XML SIN FIRMAR ===');
      this.logger.debug(xmlUnsigned);
      this.logger.debug('=== FIN XML SIN FIRMAR ===');

      await this.saveArtifact(
        invoice.id,
        ArtifactType.XML_UNSIGNED,
        xmlUnsigned,
        'application/xml',
      );

      invoice.status = InvoiceStatus.PENDING_SIGNATURE;
      await this.invoiceRepository.save(invoice);

      // Paso 3: Firmar XML usando certificado del issuer
      const xmlSigned = await this.signatureService.signXml(
        xmlUnsigned,
        invoice.issuer.certP12Path,
        invoice.issuer.certPasswordEncrypted,
      );

      this.logger.debug('=== XML FIRMADO ===');
      this.logger.debug(xmlSigned);
      this.logger.debug('=== FIN XML FIRMADO ===');

      await this.saveArtifact(
        invoice.id,
        ArtifactType.XML_SIGNED,
        xmlSigned,
        'application/xml',
      );

      invoice.status = InvoiceStatus.SIGNED;
      await this.invoiceRepository.save(invoice);
      await this.createEvent(
        invoice.id,
        InvoiceEventType.SIGNED,
        'Factura firmada',
      );

      // Paso 4: Enviar al SRI para recepción
      invoice.status = InvoiceStatus.SENDING;
      invoice.sriReceptionStatus = SriReceptionStatus.PENDING;
      await this.invoiceRepository.save(invoice);

      const receptionResponse = await this.sriService.sendToReception({
        claveAcceso: invoice.claveAcceso,
        xml: xmlSigned,
      });

      await this.saveArtifact(
        invoice.id,
        ArtifactType.RESPONSE_RECEPTION,
        JSON.stringify(receptionResponse),
        'application/json',
      );

      if (receptionResponse.estado === 'RECIBIDA') {
        invoice.sriReceptionStatus = SriReceptionStatus.RECEIVED;
        await this.createEvent(
          invoice.id,
          InvoiceEventType.RECEIVED,
          'Recibida por el SRI',
        );
      } else {
        invoice.sriReceptionStatus = SriReceptionStatus.DEVUELTA;

        // Extraer mensaje de error del primer comprobante
        let errorMessage = 'Error desconocido en recepción';
        if (
          receptionResponse.comprobantes &&
          receptionResponse.comprobantes.length > 0
        ) {
          const comprobante = receptionResponse.comprobantes[0];
          if (comprobante.mensajes && comprobante.mensajes.length > 0) {
            const primerMensaje = comprobante.mensajes[0];
            errorMessage = `[${primerMensaje.identificador}] ${primerMensaje.mensaje}`;
            if (primerMensaje.informacionAdicional) {
              errorMessage += ` - ${primerMensaje.informacionAdicional}`;
            }
          }
        }

        invoice.lastError = errorMessage;
        await this.createEvent(
          invoice.id,
          InvoiceEventType.ERROR,
          `Error en recepción: ${errorMessage}`,
        );
      }

      await this.invoiceRepository.save(invoice);

      // Paso 5: Consultar autorización
      if (invoice.sriReceptionStatus === SriReceptionStatus.RECEIVED) {
        await this.checkAuthorization(invoice.id);
      }

      this.logger.log(`Invoice ${id} authorization process completed`);

      return this.mapToResponseDto(await this.findOneEntity(id));
    } catch (error) {
      this.logger.error(`Error authorizing invoice ${id}: ${error.message}`);

      invoice.status = InvoiceStatus.ERROR;
      invoice.lastError = error.message;
      invoice.retryCount += 1;
      await this.invoiceRepository.save(invoice);

      await this.createEvent(
        invoice.id,
        InvoiceEventType.ERROR,
        `Error: ${error.message}`,
        { error: error.stack },
      );

      throw new InternalServerErrorException(
        `Error al autorizar factura: ${error.message}`,
      );
    }
  }

  /**
   * Consultar autorización en el SRI
   */
  async checkAuthorization(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.findOneEntity(id);

    if (!invoice.claveAcceso) {
      throw new BadRequestException('La factura no tiene clave de acceso');
    }

    try {
      invoice.sriAuthorizationStatus = SriAuthorizationStatus.PENDING;
      await this.invoiceRepository.save(invoice);

      const authResponse = await this.sriService.checkAuthorization(
        invoice.claveAcceso,
      );

      await this.saveArtifact(
        invoice.id,
        ArtifactType.RESPONSE_AUTH,
        JSON.stringify(authResponse),
        'application/json',
      );

      if (authResponse.estado === 'AUTORIZADO') {
        invoice.status = InvoiceStatus.AUTHORIZED;
        invoice.sriAuthorizationStatus = SriAuthorizationStatus.AUTORIZADO;
        invoice.authorizationNumber = authResponse.numeroAutorizacion;
        invoice.authorizedAt = new Date();

        // Guardar XML autorizado
        if (authResponse.comprobante) {
          await this.saveArtifact(
            invoice.id,
            ArtifactType.XML_AUTHORIZED,
            authResponse.comprobante,
            'application/xml',
          );
        }

        await this.createEvent(
          invoice.id,
          InvoiceEventType.AUTHORIZED,
          'Factura autorizada por el SRI',
          { authorizationNumber: authResponse.numeroAutorizacion },
        );
      } else if (authResponse.estado === 'NO AUTORIZADO') {
        invoice.status = InvoiceStatus.NOT_AUTHORIZED;
        invoice.sriAuthorizationStatus = SriAuthorizationStatus.NO_AUTORIZADO;

        // Extraer mensaje de error desde el array mensajes
        let errorMessage = 'No autorizada por el SRI';
        const mensajes = authResponse.mensajes;
        if (Array.isArray(mensajes) && mensajes.length > 0) {
          errorMessage = mensajes
            .map((m: any) => {
              let msg = `[${m.identificador}] ${m.mensaje}`;
              if (m.informacionAdicional) msg += ` - ${m.informacionAdicional}`;
              return msg;
            })
            .join(' | ');
        } else if (authResponse.mensaje) {
          errorMessage = authResponse.mensaje;
        }

        invoice.lastError = errorMessage;

        await this.createEvent(
          invoice.id,
          InvoiceEventType.NOT_AUTHORIZED,
          `No autorizada: ${errorMessage}`,
        );
      } else if (authResponse.estado === 'EN PROCESO') {
        invoice.sriAuthorizationStatus =
          SriAuthorizationStatus.EN_PROCESAMIENTO;
      }

      await this.invoiceRepository.save(invoice);

      return this.mapToResponseDto(invoice);
    } catch (error) {
      this.logger.error(
        `Error checking authorization for invoice ${id}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Error al consultar autorización: ${error.message}`,
      );
    }
  }

  /**
   * Reintentar autorización
   */
  async retry(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.findOneEntity(id);

    if (invoice.status === InvoiceStatus.AUTHORIZED) {
      throw new BadRequestException('La factura ya está autorizada');
    }

    if (invoice.retryCount >= 5) {
      throw new BadRequestException(
        'Se alcanzó el límite máximo de reintentos',
      );
    }

    await this.createEvent(
      invoice.id,
      InvoiceEventType.RETRY,
      'Reintentando autorización',
    );

    return this.authorize(id);
  }

  /**
   * Generar secuencial
   */
  private async generateSecuencial(issuerId: string): Promise<string> {
    const lastInvoice = await this.invoiceRepository.findOne({
      where: { issuerId },
      order: { secuencial: 'DESC' },
    });

    let nextSecuencial = 1;
    if (lastInvoice && lastInvoice.secuencial) {
      nextSecuencial = parseInt(lastInvoice.secuencial, 10) + 1;
    }

    return nextSecuencial.toString().padStart(9, '0');
  }

  /**
   * Generar clave de acceso
   */
  private async generateClaveAcceso(invoice: Invoice): Promise<string> {
    const issuer = invoice.issuer;

    const claveAcceso = generateAccessKey({
      fecha: invoice.fechaEmision,
      tipoComprobante: TipoComprobante.FACTURA,
      ruc: issuer.ruc,
      ambiente: issuer.ambiente === AmbienteType.PRODUCCION ? '2' : '1',
      serie: issuer.establecimiento + issuer.puntoEmision,
      numeroComprobante: invoice.secuencial,
      codigoNumerico: generateNumericCode(),
      tipoEmision: TipoEmision.NORMAL,
    });

    // Validar que la clave es correcta
    if (!validateAccessKey(claveAcceso)) {
      throw new InternalServerErrorException(
        'Error al generar clave de acceso válida',
      );
    }

    return claveAcceso;
  }

  /**
   * Generar XML de la factura
   */
  private async generateXml(invoice: Invoice): Promise<string> {
    const issuer = invoice.issuer;

    const invoiceData = {
      issuer: {
        ambiente: issuer.ambiente === AmbienteType.PRODUCCION ? '2' : '1',
        tipoEmision: TipoEmision.NORMAL,
        razonSocial: issuer.razonSocial,
        nombreComercial: issuer.nombreComercial || issuer.razonSocial,
        ruc: issuer.ruc,
        claveAcceso: invoice.claveAcceso,
        codDoc: TipoComprobante.FACTURA,
        estab: issuer.establecimiento,
        ptoEmi: issuer.puntoEmision,
        secuencial: invoice.secuencial,
        dirMatriz: issuer.direccionMatriz,
      },
      invoice: {
        fechaEmision: invoice.fechaEmision,
        dirEstablecimiento: issuer.direccionMatriz,
        obligadoContabilidad: issuer.obligadoContabilidad ? 'SI' : 'NO',
        tipoIdentificacionComprador: invoice.clienteTipoIdentificacion,
        razonSocialComprador: invoice.clienteRazonSocial,
        identificacionComprador: invoice.clienteIdentificacion,
        direccionComprador: invoice.clienteDireccion,
        totalSinImpuestos: invoice.totalSinImpuestos,
        totalDescuento: invoice.totalDescuento,
        totalConImpuestos: await this.calculateTotalImpuestos(invoice.id),
        propina: invoice.propina,
        importeTotal: invoice.importeTotal,
        moneda: invoice.moneda,
      },
      detalles: invoice.detalles,
      pagos: invoice.pagos,
      infoAdicional: invoice.infoAdicional || {},
    };

    return this.xmlBuilderService.buildInvoiceXml(invoiceData);
  }

  /**
   * Calcular total de impuestos
   */
  private async calculateTotalImpuestos(invoiceId: string): Promise<any[]> {
    const details = await this.detailRepository.find({
      where: { invoiceId },
      relations: ['impuestos'],
    });

    const impuestosMap = new Map();

    for (const detail of details) {
      for (const tax of detail.impuestos) {
        const key = `${tax.codigo}-${tax.codigoPorcentaje}`;
        if (!impuestosMap.has(key)) {
          impuestosMap.set(key, {
            codigo: tax.codigo,
            codigoPorcentaje: tax.codigoPorcentaje,
            baseImponible: 0,
            valor: 0,
          });
        }
        const current = impuestosMap.get(key);
        current.baseImponible += Number(tax.baseImponible);
        current.valor += Number(tax.valor);
      }
    }

    return Array.from(impuestosMap.values());
  }

  /**
   * Guardar artefacto
   */
  private async saveArtifact(
    invoiceId: string,
    type: ArtifactType,
    content: string,
    mimeType: string,
  ): Promise<void> {
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    const artifactData: any = {
      invoiceId,
      type,
      hashSha256: hash,
      mimeType,
      size: Buffer.byteLength(content, 'utf8'),
    };

    // Lógica de almacenamiento:
    // - XMLs y JSONs: guardar en DB (columna content)
    // - PDFs: guardar en Cloud Storage (columna storageKey)
    if (type === ArtifactType.RIDE_PDF) {
      // PDF: usar Cloud Storage
      const storageKey = await this.saveToStorage(invoiceId, type, content);
      artifactData.storageKey = storageKey;
      // No guardar content en DB para PDFs (son archivos binarios grandes)
    } else {
      // XML o JSON: guardar directamente en DB
      artifactData.content = content;
      // No usar filesystem para XMLs/JSONs
    }

    const artifact = this.artifactRepository.create(artifactData);

    await this.artifactRepository.save(artifact);
  }

  /**
   * Guardar archivos binarios en Cloud Storage (solo PDFs)
   */
  private async saveToStorage(
    invoiceId: string,
    type: ArtifactType,
    content: string,
  ): Promise<string> {
    const extension = type === ArtifactType.RIDE_PDF ? 'pdf' : 'dat';
    const fileName = `${invoiceId}_${type}_${Date.now()}.${extension}`;
    const storageKey = `invoices/${invoiceId}/${fileName}`;

    // Usar StorageService (soporta local, GCS, etc)
    await this.storageService.save(storageKey, content);

    return storageKey;
  }

  /**
   * Crear evento
   */
  private async createEvent(
    invoiceId: string,
    type: InvoiceEventType,
    message: string,
    payload?: Record<string, any>,
  ): Promise<void> {
    const event = this.eventRepository.create({
      invoiceId,
      type,
      message,
      payload,
    });

    await this.eventRepository.save(event);
  }

  /**
   * Obtener entidad completa
   */
  private async findOneEntity(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['detalles', 'detalles.impuestos', 'pagos', 'issuer'],
    });

    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    return invoice;
  }

  /**
   * Validar totales de la factura
   */
  private validateInvoiceTotals(dto: CreateInvoiceDto): void {
    // 1. Calcular suma de detalles
    const sumDetalles = dto.detalles.reduce((sum, d) => {
      return sum + Number(d.precioTotalSinImpuesto);
    }, 0);

    // Validar totalSinImpuestos
    const totalSinImpuestos = Number(dto.totalSinImpuestos);
    if (Math.abs(sumDetalles - totalSinImpuestos) > 0.01) {
      throw new BadRequestException(
        `totalSinImpuestos (${totalSinImpuestos}) no coincide con la suma de detalles (${sumDetalles.toFixed(2)})`,
      );
    }

    // 2. Calcular suma de impuestos
    let sumImpuestos = 0;
    dto.detalles.forEach((detalle) => {
      detalle.impuestos.forEach((imp) => {
        sumImpuestos += Number(imp.valor);
      });
    });

    // 3. Calcular importeTotal esperado
    const totalDescuento = Number(dto.totalDescuento || 0);
    const propina = Number(dto.propina || 0);
    const importeTotalEsperado =
      totalSinImpuestos + sumImpuestos + propina - totalDescuento;

    const importeTotal = Number(dto.importeTotal);
    if (Math.abs(importeTotal - importeTotalEsperado) > 0.01) {
      throw new BadRequestException(
        `importeTotal (${importeTotal}) no coincide con el cálculo esperado (${importeTotalEsperado.toFixed(2)}). ` +
          `Fórmula: totalSinImpuestos (${totalSinImpuestos}) + impuestos (${sumImpuestos.toFixed(2)}) + propina (${propina}) - descuentos (${totalDescuento})`,
      );
    }

    // 4. Validar que suma de pagos coincida con importeTotal
    const sumPagos = dto.pagos.reduce((sum, p) => sum + Number(p.total), 0);
    if (Math.abs(sumPagos - importeTotal) > 0.01) {
      throw new BadRequestException(
        `La suma de pagos (${sumPagos.toFixed(2)}) no coincide con importeTotal (${importeTotal})`,
      );
    }

    this.logger.debug('Validación de totales exitosa');
  }

  /**
   * Validar consistencia de totales usando la factura persistida en DB.
   * Previene firmar/enviar comprobantes con detalles/impuestos/pagos desalineados.
   */
  private validateInvoiceEntityTotals(invoice: Invoice): void {
    const sumDetalles = (invoice.detalles || []).reduce(
      (sum, d) => sum + Number(d.precioTotalSinImpuesto || 0),
      0,
    );
    const totalSinImpuestos = Number(invoice.totalSinImpuestos || 0);

    if (Math.abs(sumDetalles - totalSinImpuestos) > 0.01) {
      throw new BadRequestException(
        `Factura inconsistente: totalSinImpuestos (${totalSinImpuestos.toFixed(2)}) != suma de detalles (${sumDetalles.toFixed(2)})`,
      );
    }

    const sumImpuestos = (invoice.detalles || []).reduce((sum, detalle) => {
      const impuestos = detalle.impuestos || [];
      return (
        sum +
        impuestos.reduce((taxSum, imp) => taxSum + Number(imp.valor || 0), 0)
      );
    }, 0);

    const totalDescuento = Number(invoice.totalDescuento || 0);
    const propina = Number(invoice.propina || 0);
    const importeEsperado =
      totalSinImpuestos + sumImpuestos + propina - totalDescuento;
    const importeTotal = Number(invoice.importeTotal || 0);

    if (Math.abs(importeTotal - importeEsperado) > 0.01) {
      throw new BadRequestException(
        `Factura inconsistente: importeTotal (${importeTotal.toFixed(2)}) != cálculo esperado (${importeEsperado.toFixed(2)})`,
      );
    }

    const sumPagos = (invoice.pagos || []).reduce(
      (sum, p) => sum + Number(p.total || 0),
      0,
    );
    if (Math.abs(sumPagos - importeTotal) > 0.01) {
      throw new BadRequestException(
        `Factura inconsistente: suma de pagos (${sumPagos.toFixed(2)}) != importeTotal (${importeTotal.toFixed(2)})`,
      );
    }
  }

  /**
   * Mapear a DTO de respuesta
   */
  private mapToResponseDto(invoice: Invoice): InvoiceResponseDto {
    return {
      id: invoice.id,
      issuerId: invoice.issuerId,
      secuencial: invoice.secuencial,
      claveAcceso: invoice.claveAcceso,
      fechaEmision: invoice.fechaEmision,
      clienteTipoIdentificacion: invoice.clienteTipoIdentificacion,
      clienteIdentificacion: invoice.clienteIdentificacion,
      clienteRazonSocial: invoice.clienteRazonSocial,
      clienteDireccion: invoice.clienteDireccion,
      clienteEmail: invoice.clienteEmail,
      clienteTelefono: invoice.clienteTelefono,
      totalSinImpuestos: Number(invoice.totalSinImpuestos),
      totalDescuento: Number(invoice.totalDescuento),
      propina: Number(invoice.propina),
      importeTotal: Number(invoice.importeTotal),
      moneda: invoice.moneda,
      status: invoice.status,
      sriReceptionStatus: invoice.sriReceptionStatus,
      sriAuthorizationStatus: invoice.sriAuthorizationStatus,
      authorizationNumber: invoice.authorizationNumber,
      authorizedAt: invoice.authorizedAt,
      retryCount: invoice.retryCount,
      lastError: invoice.lastError,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      detalles: invoice.detalles,
      pagos: invoice.pagos,
      infoAdicional: invoice.infoAdicional,
    };
  }
}
