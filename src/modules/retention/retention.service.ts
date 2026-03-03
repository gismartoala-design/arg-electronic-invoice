import { Injectable } from '@nestjs/common';

@Injectable()
export class RetentionService {
  create(createRetentionDto: any) {
    return {
      message: 'Crear retención - Por implementar',
      data: createRetentionDto,
    };
  }

  findAll() {
    return {
      message: 'Listar retenciones - Por implementar',
      data: [],
    };
  }

  findOne(id: string) {
    return {
      message: `Obtener retención ${id} - Por implementar`,
      data: null,
    };
  }
}
