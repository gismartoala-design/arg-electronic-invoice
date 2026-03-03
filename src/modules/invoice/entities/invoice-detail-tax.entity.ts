import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InvoiceDetail } from './invoice-detail.entity';

@Entity('invoice_detail_tax')
export class InvoiceDetailTax {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  detailId: string;

  @ManyToOne(() => InvoiceDetail, (detail) => detail.impuestos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'detailId' })
  detail: InvoiceDetail;

  @Column({ type: 'varchar', length: 2 })
  codigo: string; // 2=IVA, 3=ICE, 5=IRBPNR

  @Column({ type: 'varchar', length: 2 })
  codigoPorcentaje: string; // 0=0%, 2=12%, 3=14%, 4=15%

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  tarifa: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  baseImponible: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valor: number;

  @CreateDateColumn()
  createdAt: Date;
}
