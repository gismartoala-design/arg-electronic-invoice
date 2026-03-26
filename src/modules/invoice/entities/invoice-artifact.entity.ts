import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ArtifactType } from './enums';
import { Invoice } from './invoice.entity';

@Entity('invoice_artifact')
@Index(['invoiceId', 'type'], { unique: true })
export class InvoiceArtifact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.artifacts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({
    type: 'enum',
    enum: ArtifactType,
  })
  type: ArtifactType;

  // Ruta en el storage externo (S3, local filesystem, etc.)
  @Column({ type: 'varchar', length: 500, nullable: true })
  storageKey: string | null;

  // Para contenido pequeño (JSON responses), puede guardarse en DB
  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  hashSha256: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mimeType: string | null;

  @Column({ type: 'int', nullable: true })
  size: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
