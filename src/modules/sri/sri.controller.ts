import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SriService } from './sri.service';

@ApiTags('SRI')
@Controller('sri')
export class SriController {
  constructor(private readonly sriService: SriService) {}

  @Get('connectivity')
  @ApiOperation({ summary: 'Verificar conectividad con servicios del SRI' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de conectividad con los servicios del SRI' 
  })
  checkConnectivity() {
    return this.sriService.checkConnectivity();
  }

  @Post('reception')
  @ApiOperation({ summary: 'Enviar comprobante al SRI para recepción' })
  @ApiResponse({ status: 200, description: 'Comprobante recibido por el SRI' })
  @ApiResponse({ status: 400, description: 'Error en recepción' })
  sendToReception(@Body() data: any) {
    return this.sriService.sendToReception(data);
  }

  @Get('authorization/:claveAcceso')
  @ApiOperation({ summary: 'Consultar autorización de comprobante en el SRI' })
  @ApiResponse({ status: 200, description: 'Estado de autorización obtenido' })
  @ApiResponse({ status: 404, description: 'Comprobante no encontrado' })
  checkAuthorization(@Param('claveAcceso') claveAcceso: string) {
    return this.sriService.checkAuthorization(claveAcceso);
  }
}
