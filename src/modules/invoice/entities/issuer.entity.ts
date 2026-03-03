import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AmbienteType } from './enums';
import { Invoice } from './invoice.entity';

@Entity('issuer')
export class Issuer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 13, unique: true })
  ruc: string;

  @Column({ type: 'varchar', length: 300 })
  razonSocial: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  nombreComercial: string;

  @Column({ type: 'varchar', length: 500 })
  direccionMatriz: string;

  @Column({
    type: 'enum',
    enum: AmbienteType,
    default: AmbienteType.PRUEBAS,
  })
  ambiente: AmbienteType;

  @Column({ type: 'varchar', length: 3 })
  establecimiento: string;

  @Column({ type: 'varchar', length: 3 })
  puntoEmision: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  certP12Path: string;

  // Almacenar encriptado o usar un secret manager
  @Column({ type: 'text', nullable: true })
  certPasswordEncrypted: string;

  @Column({ type: 'boolean', default: false })
  obligadoContabilidad: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Invoice, (invoice) => invoice.issuer)
  invoices: Invoice[];
}
