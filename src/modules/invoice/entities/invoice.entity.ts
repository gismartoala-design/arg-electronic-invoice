import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import {
  InvoiceStatus,
  SriReceptionStatus,
  SriAuthorizationStatus,
} from './enums';
import { Issuer } from './issuer.entity';
import { InvoiceDetail } from './invoice-detail.entity';
import { InvoicePayment } from './invoice-payment.entity';
import { InvoiceArtifact } from './invoice-artifact.entity';
import { InvoiceEvent } from './invoice-event.entity';

@Entity('invoice')
@Index(['issuerId', 'establecimiento', 'puntoEmision', 'secuencial'], {
  unique: true,
})
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  issuerId: string;

  @ManyToOne(() => Issuer, (issuer) => issuer.invoices)
  @JoinColumn({ name: 'issuerId' })
  issuer: Issuer;

  @Column({ type: 'varchar', length: 9 })
  secuencial: string;

  @Column({ type: 'varchar', length: 3 })
  establecimiento: string;

  @Column({ type: 'varchar', length: 3 })
  puntoEmision: string;

  @Column({ type: 'varchar', length: 49, unique: true, nullable: true })
  claveAcceso: string;

  @Column({ type: 'varchar', length: 10 })
  fechaEmision: string; // Formato: DD/MM/YYYY

  // Información del Cliente
  @Column({ type: 'varchar', length: 2 })
  clienteTipoIdentificacion: string;

  @Column({ type: 'varchar', length: 20 })
  clienteIdentificacion: string;

  @Column({ type: 'varchar', length: 300 })
  clienteRazonSocial: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  clienteDireccion: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  clienteEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  clienteTelefono: string;

  // Totales
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalSinImpuestos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDescuento: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  propina: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  importeTotal: number;

  @Column({ type: 'varchar', length: 10, default: 'DOLAR' })
  moneda: string;

  // Estados
  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({
    type: 'enum',
    enum: SriReceptionStatus,
    nullable: true,
  })
  sriReceptionStatus: SriReceptionStatus;

  @Column({
    type: 'enum',
    enum: SriAuthorizationStatus,
    nullable: true,
  })
  sriAuthorizationStatus: SriAuthorizationStatus;

  @Column({ type: 'varchar', length: 49, nullable: true })
  authorizationNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  authorizedAt: Date;

  // Control de reintentos
  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  // Información adicional
  @Column({ type: 'jsonb', nullable: true })
  infoAdicional: Record<string, string>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => InvoiceDetail, (detail) => detail.invoice, {
    cascade: true,
  })
  detalles: InvoiceDetail[];

  @OneToMany(() => InvoicePayment, (payment) => payment.invoice, {
    cascade: true,
  })
  pagos: InvoicePayment[];

  @OneToMany(() => InvoiceArtifact, (artifact) => artifact.invoice)
  artifacts: InvoiceArtifact[];

  @OneToMany(() => InvoiceEvent, (event) => event.invoice)
  events: InvoiceEvent[];
}
