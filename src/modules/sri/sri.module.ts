import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SriService } from './sri.service';
import { SriController } from './sri.controller';

@Module({
  imports: [HttpModule],
  controllers: [SriController],
  providers: [SriService],
  exports: [SriService],
})
export class SriModule {}
