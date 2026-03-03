import { Injectable } from '@nestjs/common';

@Injectable()
export class RemissionGuideService {
  create(createRemissionGuideDto: any) {
    return {
      message: 'Crear guía de remisión - Por implementar',
      data: createRemissionGuideDto,
    };
  }

  findAll() {
    return {
      message: 'Listar guías de remisión - Por implementar',
      data: [],
    };
  }

  findOne(id: string) {
    return {
      message: `Obtener guía de remisión ${id} - Por implementar`,
      data: null,
    };
  }
}
