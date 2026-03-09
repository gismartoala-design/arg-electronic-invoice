import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import {
  Invoice,
  InvoiceDetail,
  InvoiceDetailTax,
  InvoicePayment,
  InvoiceArtifact,
  InvoiceEvent,
  Issuer,
} from './entities';
import { XmlBuilderModule } from '../xml-builder/xml-builder.module';
import { SignatureModule } from '../signature/signature.module';
import { SriModule } from '../sri/sri.module';
import { StorageModule } from '../storage/storage.module';
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceDetail,
      InvoiceDetailTax,
      InvoicePayment,
      InvoiceArtifact,
      InvoiceEvent,
      Issuer,
    ]),
    XmlBuilderModule,
    SignatureModule,
    SriModule,
    StorageModule,
    PdfGeneratorModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
