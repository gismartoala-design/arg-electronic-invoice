import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignatureService } from './signature.service';

@ApiTags('Firma Digital')
@Controller('signature')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @Get('certificate/info')
  @ApiOperation({ summary: 'Obtener información del certificado digital' })
  @ApiResponse({
    status: 200,
    description: 'Información del certificado',
  })
  async getCertificateInfo() {
    return this.signatureService.getCertificateInfo();
  }

  @Get('certificate/verify')
  @ApiOperation({ summary: 'Verificar validez del certificado digital' })
  @ApiResponse({
    status: 200,
    description: 'Estado de validez del certificado',
  })
  async verifyCertificate() {
    const isValid = await this.signatureService.verifyCertificate();
    return {
      isValid,
      message: isValid
        ? 'El certificado es válido'
        : 'El certificado no es válido o ha expirado',
    };
  }

  @Post('test-sign')
  @ApiOperation({ summary: 'Probar firma digital con XML de ejemplo' })
  @ApiResponse({
    status: 200,
    description: 'XML firmado exitosamente',
  })
  async testSign(@Body() body: { xml: string }) {
    const signedXml = await this.signatureService.signXml(body.xml);
    return {
      success: true,
      signedXml,
    };
  }

  @Post('verify-signature')
  @ApiOperation({ summary: 'Verificar firma de un XML' })
  @ApiResponse({
    status: 200,
    description: 'Resultado de verificación',
  })
  async verifySignature(@Body() body: { signedXml: string }) {
    const isValid = await this.signatureService.verifyXmlSignature(
      body.signedXml,
    );
    return {
      isValid,
      message: isValid ? 'Firma válida' : 'Firma inválida',
    };
  }
}
