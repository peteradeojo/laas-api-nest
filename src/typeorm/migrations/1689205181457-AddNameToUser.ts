import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameToUser1689205181457 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE users ADD name varchar(30) NOT NULL', []);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE users DROP COLUMN name', []);
  }
}
