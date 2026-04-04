import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropIssuerRucUniqueConstraint1772600000000
  implements MigrationInterface
{
  name = 'DropIssuerRucUniqueConstraint1772600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "issuer" DROP CONSTRAINT "UQ_ce4a0faf5b5a25ff03acef7fc72"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "issuer" ADD CONSTRAINT "UQ_ce4a0faf5b5a25ff03acef7fc72" UNIQUE ("ruc")`,
    );
  }
}
