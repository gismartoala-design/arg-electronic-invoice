import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1772294919620 implements MigrationInterface {
    name = 'InitialSchema1772294919620'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invoice_detail_tax" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "detailId" uuid NOT NULL, "codigo" character varying(2) NOT NULL, "codigoPorcentaje" character varying(2) NOT NULL, "tarifa" numeric(5,2) NOT NULL, "baseImponible" numeric(12,2) NOT NULL, "valor" numeric(12,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7224c768b1e4d0e85d824a3bc6b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoice_detail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceId" uuid NOT NULL, "codigoPrincipal" character varying(50) NOT NULL, "codigoAuxiliar" character varying(50), "descripcion" character varying(500) NOT NULL, "cantidad" numeric(12,6) NOT NULL, "precioUnitario" numeric(12,6) NOT NULL, "descuento" numeric(12,2) NOT NULL DEFAULT '0', "precioTotalSinImpuesto" numeric(12,2) NOT NULL, "detallesAdicionales" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3d65640b01305b25702d2de67c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoice_payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceId" uuid NOT NULL, "formaPago" character varying(2) NOT NULL, "total" numeric(12,2) NOT NULL, "plazo" integer, "unidadTiempo" character varying(20), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b63cfba23ecc43531b5c571ffa3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."invoice_artifact_type_enum" AS ENUM('XML_UNSIGNED', 'XML_SIGNED', 'XML_AUTHORIZED', 'RIDE_PDF', 'RESPONSE_RECEPTION', 'RESPONSE_AUTH')`);
        await queryRunner.query(`CREATE TABLE "invoice_artifact" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceId" uuid NOT NULL, "type" "public"."invoice_artifact_type_enum" NOT NULL, "storageKey" character varying(500), "content" text, "hashSha256" character varying(64), "mimeType" character varying(20), "size" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dfbec02bafd45585e2e212db1bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3d710b380c11a39df12cce9d12" ON "invoice_artifact" ("invoiceId", "type") `);
        await queryRunner.query(`CREATE TYPE "public"."invoice_event_type_enum" AS ENUM('CREATED', 'SIGNED', 'SENT', 'RECEIVED', 'AUTHORIZED', 'NOT_AUTHORIZED', 'ERROR', 'RETRY', 'CANCELLED', 'UPDATED')`);
        await queryRunner.query(`CREATE TABLE "invoice_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceId" uuid NOT NULL, "type" "public"."invoice_event_type_enum" NOT NULL, "message" character varying(500), "payload" jsonb, "userId" character varying(100), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f4b184165e5ef7d315ccff5d700" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_104e1da40e18dd1c9236a0de34" ON "invoice_event" ("invoiceId", "createdAt") `);
        await queryRunner.query(`CREATE TYPE "public"."invoice_status_enum" AS ENUM('DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'SENDING', 'AUTHORIZED', 'NOT_AUTHORIZED', 'ERROR', 'CANCELLED')`);
        await queryRunner.query(`CREATE TYPE "public"."invoice_srireceptionstatus_enum" AS ENUM('PENDING', 'RECEIVED', 'DEVUELTA', 'ERROR')`);
        await queryRunner.query(`CREATE TYPE "public"."invoice_sriauthorizationstatus_enum" AS ENUM('PENDING', 'EN_PROCESAMIENTO', 'AUTORIZADO', 'NO_AUTORIZADO', 'DEVUELTA')`);
        await queryRunner.query(`CREATE TABLE "invoice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "issuerId" uuid NOT NULL, "secuencial" character varying(9) NOT NULL, "claveAcceso" character varying(49), "fechaEmision" character varying(10) NOT NULL, "clienteTipoIdentificacion" character varying(2) NOT NULL, "clienteIdentificacion" character varying(20) NOT NULL, "clienteRazonSocial" character varying(300) NOT NULL, "clienteDireccion" character varying(500), "clienteEmail" character varying(100), "clienteTelefono" character varying(20), "totalSinImpuestos" numeric(12,2) NOT NULL, "totalDescuento" numeric(12,2) NOT NULL DEFAULT '0', "propina" numeric(12,2) NOT NULL DEFAULT '0', "importeTotal" numeric(12,2) NOT NULL, "moneda" character varying(10) NOT NULL DEFAULT 'DOLAR', "status" "public"."invoice_status_enum" NOT NULL DEFAULT 'DRAFT', "sriReceptionStatus" "public"."invoice_srireceptionstatus_enum", "sriAuthorizationStatus" "public"."invoice_sriauthorizationstatus_enum", "authorizationNumber" character varying(49), "authorizedAt" TIMESTAMP, "retryCount" integer NOT NULL DEFAULT '0', "lastError" text, "infoAdicional" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7789f5aa4883d85d353cf74fc71" UNIQUE ("claveAcceso"), CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9e36afac433c2697cf6a8fddd1" ON "invoice" ("issuerId", "secuencial") `);
        await queryRunner.query(`CREATE TYPE "public"."issuer_ambiente_enum" AS ENUM('PRUEBAS', 'PRODUCCION')`);
        await queryRunner.query(`CREATE TABLE "issuer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ruc" character varying(13) NOT NULL, "razonSocial" character varying(300) NOT NULL, "nombreComercial" character varying(300), "direccionMatriz" character varying(500) NOT NULL, "ambiente" "public"."issuer_ambiente_enum" NOT NULL DEFAULT 'PRUEBAS', "establecimiento" character varying(3) NOT NULL, "puntoEmision" character varying(3) NOT NULL, "certP12Path" character varying(500), "certPasswordEncrypted" text, "obligadoContabilidad" boolean NOT NULL DEFAULT false, "email" character varying(100), "telefono" character varying(20), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ce4a0faf5b5a25ff03acef7fc72" UNIQUE ("ruc"), CONSTRAINT "PK_0650c5a53be3a0d22b580e27d25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "invoice_detail_tax" ADD CONSTRAINT "FK_9974492e7acc7b809bc9ad60225" FOREIGN KEY ("detailId") REFERENCES "invoice_detail"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_detail" ADD CONSTRAINT "FK_d4843ef5fb0acb6a1ea470236c6" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_payment" ADD CONSTRAINT "FK_29141a2a8c2192636ca4826fa4d" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_artifact" ADD CONSTRAINT "FK_3d79a15ec820495acb8aa5d3e71" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_event" ADD CONSTRAINT "FK_55d3fe7a84cc94fe0cb79a97b4d" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_098e2b1653b00e9cfd9af43703e" FOREIGN KEY ("issuerId") REFERENCES "issuer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_098e2b1653b00e9cfd9af43703e"`);
        await queryRunner.query(`ALTER TABLE "invoice_event" DROP CONSTRAINT "FK_55d3fe7a84cc94fe0cb79a97b4d"`);
        await queryRunner.query(`ALTER TABLE "invoice_artifact" DROP CONSTRAINT "FK_3d79a15ec820495acb8aa5d3e71"`);
        await queryRunner.query(`ALTER TABLE "invoice_payment" DROP CONSTRAINT "FK_29141a2a8c2192636ca4826fa4d"`);
        await queryRunner.query(`ALTER TABLE "invoice_detail" DROP CONSTRAINT "FK_d4843ef5fb0acb6a1ea470236c6"`);
        await queryRunner.query(`ALTER TABLE "invoice_detail_tax" DROP CONSTRAINT "FK_9974492e7acc7b809bc9ad60225"`);
        await queryRunner.query(`DROP TABLE "issuer"`);
        await queryRunner.query(`DROP TYPE "public"."issuer_ambiente_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9e36afac433c2697cf6a8fddd1"`);
        await queryRunner.query(`DROP TABLE "invoice"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_sriauthorizationstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_srireceptionstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_104e1da40e18dd1c9236a0de34"`);
        await queryRunner.query(`DROP TABLE "invoice_event"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_event_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d710b380c11a39df12cce9d12"`);
        await queryRunner.query(`DROP TABLE "invoice_artifact"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_artifact_type_enum"`);
        await queryRunner.query(`DROP TABLE "invoice_payment"`);
        await queryRunner.query(`DROP TABLE "invoice_detail"`);
        await queryRunner.query(`DROP TABLE "invoice_detail_tax"`);
    }

}
