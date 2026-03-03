import { Injectable } from '@nestjs/common';

@Injectable()
export class DebitNoteService {
  create(createDebitNoteDto: any) {
    return {
      message: 'Crear nota de débito - Por implementar',
      data: createDebitNoteDto,
    };
  }

  findAll() {
    return {
      message: 'Listar notas de débito - Por implementar',
      data: [],
    };
  }

  findOne(id: string) {
    return {
      message: `Obtener nota de débito ${id} - Por implementar`,
      data: null,
    };
  }
}
