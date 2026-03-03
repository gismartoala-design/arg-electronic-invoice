import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { InvoiceEventType } from './enums';
import { Invoice } from './invoice.entity';

@Entity('invoice_event')
@Index(['invoiceId', 'createdAt'])
export class InvoiceEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({
    type: 'enum',
    enum: InvoiceEventType,
  })
  type: InvoiceEventType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  message: string;

  // Payload con información adicional del evento
  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userId: string; // Usuario que ejecutó la acción

  @CreateDateColumn()
  createdAt: Date;
}
