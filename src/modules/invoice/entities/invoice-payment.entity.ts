import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_payment')
export class InvoicePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.pagos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ type: 'varchar', length: 2 })
  formaPago: string; // 01=Efectivo, 16=Tarjeta crédito, etc

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ type: 'int', nullable: true })
  plazo: number; // Plazo en días

  @Column({ type: 'varchar', length: 20, nullable: true })
  unidadTiempo: string; // dias, meses, años

  @CreateDateColumn()
  createdAt: Date;
}
