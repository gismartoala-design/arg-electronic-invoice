import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceDetailTax } from './invoice-detail-tax.entity';

@Entity('invoice_detail')
export class InvoiceDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ type: 'varchar', length: 50 })
  codigoPrincipal: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigoAuxiliar: string;

  @Column({ type: 'varchar', length: 500 })
  descripcion: string;

  @Column({ type: 'decimal', precision: 12, scale: 6 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 6 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  descuento: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precioTotalSinImpuesto: number;

  @Column({ type: 'jsonb', nullable: true })
  detallesAdicionales: Record<string, string>;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => InvoiceDetailTax, (tax) => tax.detail, {
    cascade: true,
  })
  impuestos: InvoiceDetailTax[];
}
