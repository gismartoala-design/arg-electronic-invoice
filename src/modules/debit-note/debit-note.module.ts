import { Module } from '@nestjs/common';
import { DebitNoteController } from './debit-note.controller';
import { DebitNoteService } from './debit-note.service';

@Module({
  controllers: [DebitNoteController],
  providers: [DebitNoteService],
  exports: [DebitNoteService],
})
export class DebitNoteModule {}
