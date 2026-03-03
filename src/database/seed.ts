import { DataSource } from 'typeorm';
import { Issuer } from '../modules/invoice/entities';
import { AmbienteType } from '../modules/invoice/entities/enums';

export async function seedDatabase(dataSource: DataSource) {
  const issuerRepository = dataSource.getRepository(Issuer);

  // Verificar si ya existe un emisor
  const existingIssuer = await issuerRepository.findOne({
    where: { ruc: '0956540116001' },
  });

  if (existingIssuer) {
    console.log('✅ Los datos de prueba ya existen');
    return;
  }

  // Crear emisor de prueba
  const issuer = issuerRepository.create({
    ruc: '0956540116001',
    razonSocial: 'ANDRADE VELASQUEZ MARIA SOL',
    nombreComercial: 'DOVI INSUMOS',
    direccionMatriz: 'Pancho Jacome Sl 4A Mz 252',
    ambiente: AmbienteType.PRUEBAS,
    establecimiento: '001',
    puntoEmision: '001',
    certP12Path: './certificates/MARIA SOL ANDRADE VELASQUEZ 0956540116-250226123819.p12',
    certPasswordEncrypted: 'Mar1asol2026.',
    obligadoContabilidad: false,
    email: 'sola91140@gmail.com',
    telefono: '0964231295',
    isActive: true,
  });

  await issuerRepository.save(issuer);

  console.log('✅ Emisor de prueba creado exitosamente');
  console.log('   RUC:', issuer.ruc);
  console.log('   Razón Social:', issuer.razonSocial);
  console.log('   ID:', issuer.id);
}
