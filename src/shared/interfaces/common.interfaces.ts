export interface ICompanyInfo {
  ruc: string;
  name: string;
  tradeName: string;
  address: string;
  email: string;
  phone: string;
}

export interface ISriConfig {
  receptionUrl: string;
  authorizationUrl: string;
  ambiente: string;
}

export interface ISignatureConfig {
  path: string;
  password: string;
}

export interface IAccessKey {
  fecha: string;
  tipoComprobante: string;
  ruc: string;
  ambiente: string;
  serie: string;
  numeroComprobante: string;
  codigoNumerico: string;
  tipoEmision: string;
}

export interface IElectronicDocument {
  claveAcceso: string;
  xml: string;
  xmlFirmado?: string;
  estado?: string;
  fechaAutorizacion?: Date;
  numeroAutorizacion?: string;
}

export interface ISriResponse {
  estado: string;
  comprobantes?: any[];
  mensaje?: string;
  autorizaciones?: any[];
}

export interface IInvoiceInfo {
  fechaEmision: string;
  establecimiento: string;
  puntoEmision: string;
  secuencial: string;
  totalSinImpuestos: number;
  totalDescuento: number;
  propina?: number;
  importeTotal: number;
}
