import dataSource from './data-source';
import { seedDatabase } from './seed';

async function runSeed() {
  try {
    await dataSource.initialize();
    console.log('📦 Conexión a base de datos establecida');

    await seedDatabase(dataSource);

    await dataSource.destroy();
    console.log('✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  }
}

runSeed();
