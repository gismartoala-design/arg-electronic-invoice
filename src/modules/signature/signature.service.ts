import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as forge from 'node-forge';
import { Crypto } from '@peculiar/webcrypto';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import * as xadesjs from 'xadesjs';
import { SignedXml } from 'xml-crypto';
import * as xpath from 'xpath';

const webcrypto = new Crypto();
xadesjs.Application.setEngine('node', webcrypto);
xadesjs.setNodeDependencies({
  DOMParser,
  XMLSerializer,
  xpath,
});

@Injectable()
export class SignatureService {
  private readonly logger = new Logger(SignatureService.name);
  private readonly signaturePath: string;
  private readonly signaturePassword: string;

  constructor(private readonly configService: ConfigService) {
    this.signaturePath = this.configService.get<string>('signature.path') || '';
    this.signaturePassword =
      this.configService.get<string>('signature.password') || '';
  }

  /**
   * Firma XAdES-BES (enveloped) para SRI.
   */
  async signXml(xmlContent: string): Promise<string> {
    this.logger.log('Firmando XML con XAdES-BES (xadesjs)');

    const { certPem, keyPem } = this.loadP12AsPem();

    const doc = new DOMParser().parseFromString(xmlContent, 'text/xml');
    const root = doc.documentElement;
    if (!root) throw new Error('XML inválido: no existe elemento raíz');

    // SRI típicamente usa id="comprobante"
    if (!root.getAttribute('id')) root.setAttribute('id', 'comprobante');

    // Importar llave PKCS8 a WebCrypto
    const keyDer = privateKeyPemToPkcs8Der(keyPem);
    const importAlg: RsaHashedImportParams = {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-1' },
    };

    const signingKey = await webcrypto.subtle.importKey(
      'pkcs8',
      keyDer,
      importAlg,
      false,
      ['sign'],
    );

    // Tipos de xadesjs/xmldsigjs no siempre exponen todo => any
    const signedXml: any = new (xadesjs as any).SignedXml();

    // KeyInfo/XAdES requiere cert en base64 sin headers PEM
    const certBase64 = certPem
      .replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\s+/g, '');

    // Firmar usando opciones oficiales de xmldsigjs/xadesjs
    const signAlg: any = { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-1' } };
    await signedXml.Sign(signAlg, signingKey, doc, {
      references: [
        {
          uri: '#comprobante',
          hash: 'SHA-1',
          transforms: ['enveloped', 'exc-c14n'],
        },
      ],
      x509: [certBase64],
      signingCertificate: {
        certificate: certBase64,
        digestAlgorithm: 'SHA-1',
      },
    });

    let out = signedXml.toString();

    // Evita el error 35 por mezcla de namespaces ds:
    out = ensureDsPrefix(out);

    return out;
  }

  /**
   * Verifica si el certificado está vigente (fechas).
   */
  async verifyCertificate(): Promise<boolean> {
    try {
      const { certificate } = await this.loadCertificate();

      const now = new Date();
      const notBefore = certificate.validity.notBefore;
      const notAfter = certificate.validity.notAfter;

      if (now < notBefore) return false;
      if (now > notAfter) return false;

      return true;
    } catch (e: any) {
      this.logger.error(`Error verificando certificado: ${e?.message ?? e}`);
      return false;
    }
  }

  /**
   * Info del certificado (para tu endpoint /certificate/info).
   */
  async getCertificateInfo(): Promise<{
    subject: Record<string, string>;
    issuer: Record<string, string>;
    validity: { notBefore: Date; notAfter: Date };
    serialNumber: string;
    isValid: boolean;
    daysUntilExpiration: number;
  }> {
    const { certificate } = await this.loadCertificate();

    const now = new Date();
    const notAfter = certificate.validity.notAfter;
    const daysUntilExpiration = Math.floor(
      (notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    const isValid = now >= certificate.validity.notBefore && now <= notAfter;

    const subject = certificate.subject.attributes.reduce(
      (acc, attr) => {
        const key = (attr.shortName || attr.name || 'unknown') as string;
        acc[key] = String(attr.value);
        return acc;
      },
      {} as Record<string, string>,
    );

    const issuer = certificate.issuer.attributes.reduce(
      (acc, attr) => {
        const key = (attr.shortName || attr.name || 'unknown') as string;
        acc[key] = String(attr.value);
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      subject,
      issuer,
      validity: {
        notBefore: certificate.validity.notBefore,
        notAfter: certificate.validity.notAfter,
      },
      serialNumber: certificate.serialNumber,
      isValid,
      daysUntilExpiration,
    };
  }

  /**
   * Verificación básica de firma XMLDSig (útil para tests internos).
   * Ojo: esto NO reemplaza la validación real del SRI, pero ayuda a detectar firmas rotas.
   */
  async verifyXmlSignature(signedXml: string): Promise<boolean> {
    try {
      const doc = new DOMParser().parseFromString(signedXml, 'text/xml');
      const select = xpath.useNamespaces({
        ds: 'http://www.w3.org/2000/09/xmldsig#',
      });
      const signatures = select('//ds:Signature', doc) as Node[];

      if (!signatures?.length) return false;

      const signatureNode = signatures[0];
      const sig = new SignedXml();

      sig.loadSignature(new XMLSerializer().serializeToString(signatureNode));

      // Usamos la llave pública del certificado del P12
      const { certificate } = await this.loadCertificate();
      const publicKeyPem = forge.pki.publicKeyToPem(certificate.publicKey);

      (sig as any).keyInfoProvider = {
        getKeyInfo: () => '',
        getKey: () => Buffer.from(publicKeyPem),
      };

      return sig.checkSignature(signedXml);
    } catch (e: any) {
      this.logger.error(`Error verificando firma: ${e?.message ?? e}`);
      return false;
    }
  }

  // ==============================
  //  Helpers: certificados / PEM
  // ==============================

  private loadP12AsPem(): { certPem: string; keyPem: string } {
    const { certificate, privateKey } = this.loadCertificateSync();
    return {
      certPem: forge.pki.certificateToPem(certificate),
      keyPem: forge.pki.privateKeyToPem(privateKey),
    };
  }

  private async loadCertificate(): Promise<{
    privateKey: forge.pki.rsa.PrivateKey;
    certificate: forge.pki.Certificate;
  }> {
    // no hay async real aquí, pero mantengo firma async por compatibilidad con tu código
    return this.loadCertificateSync();
  }

  private loadCertificateSync(): {
    privateKey: forge.pki.rsa.PrivateKey;
    certificate: forge.pki.Certificate;
  } {
    if (!fs.existsSync(this.signaturePath)) {
      throw new Error(`No se encontró el .p12 en: ${this.signaturePath}`);
    }

    const p12Buffer = fs.readFileSync(this.signaturePath);
    const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(
      p12Asn1,
      false,
      this.signaturePassword,
    );

    // Obtener certificados de forma segura
    const certBagsResult = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certBags = (certBagsResult && certBagsResult[forge.pki.oids.certBag]) || [];

    // Obtener llaves privadas de forma segura
    const pkcs8BagsResult = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    let keyBags = (pkcs8BagsResult && pkcs8BagsResult[forge.pki.oids.pkcs8ShroudedKeyBag]) || [];
    
    // Si no se encontró en pkcs8ShroudedKeyBag, buscar en keyBag
    if (!keyBags || keyBags.length === 0) {
      const keyBagsResult = p12.getBags({ bagType: forge.pki.oids.keyBag });
      keyBags = (keyBagsResult && keyBagsResult[forge.pki.oids.keyBag]) || [];
    }

    const cert = certBags?.[0]?.cert;
    const key = keyBags?.[0]?.key;

    if (!cert) throw new Error('No se encontró certificado en el P12');
    if (!key) throw new Error('No se encontró clave privada en el P12');

    return {
      privateKey: key as forge.pki.rsa.PrivateKey,
      certificate: cert,
    };
  }
}

// ==============================
// Helpers de utilidades
// ==============================

function privateKeyPemToPkcs8Der(keyPem: string): ArrayBuffer {
  if (keyPem.includes('BEGIN PRIVATE KEY')) {
    return pemToDer(keyPem);
  }

  if (keyPem.includes('BEGIN RSA PRIVATE KEY')) {
    const rsaKey = forge.pki.privateKeyFromPem(keyPem) as forge.pki.rsa.PrivateKey;
    const rsaPrivateKeyAsn1 = forge.pki.privateKeyToAsn1(rsaKey);
    const pkcs8Asn1 = forge.pki.wrapRsaPrivateKey(rsaPrivateKeyAsn1);
    const pkcs8DerBytes = forge.asn1.toDer(pkcs8Asn1).getBytes();
    const buf = Buffer.from(pkcs8DerBytes, 'binary');
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }

  throw new Error(
    'Formato de clave privada no soportado. Se esperaba PKCS#8 o RSA PRIVATE KEY.',
  );
}

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
  const buf = Buffer.from(b64, 'base64');
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

/**
 * Fix para que no queden prefijos ds: sueltos con Signature default xmlns.
 * Esto evita el error 35 de "estructura XML".
 */
function ensureDsPrefix(xml: string): string {
  if (xml.includes('<ds:Signature')) return xml;

  const hasDefaultSig = xml.includes(
    '<Signature xmlns="http://www.w3.org/2000/09/xmldsig#"',
  );
  const hasDs = xml.includes('ds:');
  if (!hasDefaultSig || !hasDs) return xml;

  xml = xml.replace(
    /<Signature([^>]*)xmlns="http:\/\/www\.w3\.org\/2000\/09\/xmldsig#"/,
    `<ds:Signature$1xmlns:ds="http://www.w3.org/2000/09/xmldsig#"`,
  );
  xml = xml.replace(/<\/Signature>/g, '</ds:Signature>');

  const tags = [
    'SignedInfo',
    'CanonicalizationMethod',
    'SignatureMethod',
    'Reference',
    'Transforms',
    'Transform',
    'DigestMethod',
    'DigestValue',
    'SignatureValue',
    'KeyInfo',
    'X509Data',
    'X509Certificate',
    'Object',
  ];

  for (const t of tags) {
    xml = xml.replace(new RegExp(`<${t}(\\s|>)`, 'g'), `<ds:${t}$1`);
    xml = xml.replace(new RegExp(`</${t}>`, 'g'), `</ds:${t}>`);
  }

  return xml;
}
