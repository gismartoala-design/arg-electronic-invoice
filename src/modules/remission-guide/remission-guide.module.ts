import { Module } from '@nestjs/common';
import { RemissionGuideController } from './remission-guide.controller';
import { RemissionGuideService } from './remission-guide.service';

@Module({
  controllers: [RemissionGuideController],
  providers: [RemissionGuideService],
  exports: [RemissionGuideService],
})
export class RemissionGuideModule {}
