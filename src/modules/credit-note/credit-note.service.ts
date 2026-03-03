import { Injectable } from '@nestjs/common';

@Injectable()
export class CreditNoteService {
  create(createCreditNoteDto: any) {
    return {
      message: 'Crear nota de crédito - Por implementar',
      data: createCreditNoteDto,
    };
  }

  findAll() {
    return {
      message: 'Listar notas de crédito - Por implementar',
      data: [],
    };
  }

  findOne(id: string) {
    return {
      message: `Obtener nota de crédito ${id} - Por implementar`,
      data: null,
    };
  }
}
