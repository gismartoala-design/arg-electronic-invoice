import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceAmbiente1772500000000 implements MigrationInterface {
  name = 'AddInvoiceAmbiente1772500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."invoice_ambiente_enum" AS ENUM('PRUEBAS', 'PRODUCCION')`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "ambiente" "public"."invoice_ambiente_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "ambiente"`);
    await queryRunner.query(`DROP TYPE "public"."invoice_ambiente_enum"`);
  }
}
