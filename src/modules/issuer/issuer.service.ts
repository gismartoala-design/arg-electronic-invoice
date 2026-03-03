import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issuer } from '../invoice/entities';
import { CreateIssuerDto, UpdateIssuerDto, IssuerResponseDto } from './dto/issuer.dto';
import { validateRuc } from '../../shared/utils/validation.util';

@Injectable()
export class IssuerService {
  constructor(
    @InjectRepository(Issuer)
    private readonly issuerRepository: Repository<Issuer>,
  ) {}

  async create(createIssuerDto: CreateIssuerDto): Promise<IssuerResponseDto> {
    // Validar RUC
    if (!validateRuc(createIssuerDto.ruc)) {
      throw new ConflictException('RUC inválido');
    }

    // Verificar que no exista
    const existing = await this.issuerRepository.findOne({
      where: { ruc: createIssuerDto.ruc },
    });

    if (existing) {
      throw new ConflictException('Ya existe un emisor con ese RUC');
    }

    const issuer = this.issuerRepository.create(createIssuerDto);
    const saved = await this.issuerRepository.save(issuer);

    return this.mapToResponseDto(saved);
  }

  async findAll(): Promise<IssuerResponseDto[]> {
    const issuers = await this.issuerRepository.find({
      order: { createdAt: 'DESC' },
    });

    return issuers.map((issuer) => this.mapToResponseDto(issuer));
  }

  async findOne(id: string): Promise<IssuerResponseDto> {
    const issuer = await this.issuerRepository.findOne({ where: { id } });

    if (!issuer) {
      throw new NotFoundException(`Emisor con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(issuer);
  }

  async findByRuc(ruc: string): Promise<IssuerResponseDto> {
    const issuer = await this.issuerRepository.findOne({ where: { ruc } });

    if (!issuer) {
      throw new NotFoundException(`Emisor con RUC ${ruc} no encontrado`);
    }

    return this.mapToResponseDto(issuer);
  }

  async update(id: string, updateIssuerDto: UpdateIssuerDto): Promise<IssuerResponseDto> {
    const issuer = await this.issuerRepository.findOne({ where: { id } });

    if (!issuer) {
      throw new NotFoundException(`Emisor con ID ${id} no encontrado`);
    }

    Object.assign(issuer, updateIssuerDto);
    const updated = await this.issuerRepository.save(issuer);

    return this.mapToResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const issuer = await this.issuerRepository.findOne({ where: { id } });

    if (!issuer) {
      throw new NotFoundException(`Emisor con ID ${id} no encontrado`);
    }

    await this.issuerRepository.remove(issuer);
  }

  private mapToResponseDto(issuer: Issuer): IssuerResponseDto {
    return {
      id: issuer.id,
      ruc: issuer.ruc,
      razonSocial: issuer.razonSocial,
      nombreComercial: issuer.nombreComercial,
      direccionMatriz: issuer.direccionMatriz,
      ambiente: issuer.ambiente,
      establecimiento: issuer.establecimiento,
      puntoEmision: issuer.puntoEmision,
      obligadoContabilidad: issuer.obligadoContabilidad,
      email: issuer.email,
      telefono: issuer.telefono,
      isActive: issuer.isActive,
      createdAt: issuer.createdAt,
      updatedAt: issuer.updatedAt,
    };
  }
}
