#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1f062d5503c1b64ef0928ab6f55794afb0e9ad5968fe0595498e4a16b1816074/contract';
import endContract from '../../snapshots/1f062d5503c1b64ef0928ab6f55794afb0e9ad5968fe0595498e4a16b1816074/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/30b4eff256bddc415c60d3d66e229456e30398d772faef41c7169305545a92ea/contract';
import startContract from '../../snapshots/30b4eff256bddc415c60d3d66e229456e30398d772faef41c7169305545a92ea/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'auditLog',
        columns: [
          col('action', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('ipAddress', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('metadata', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('organizationId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('resource', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('resourceId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('userAgent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_organizationId_createdAt_idx_c52d1cc3',
        columns: ['organizationId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_organizationId_idx_2e17ef41',
        columns: ['organizationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_resource_resourceId_idx_d779a931',
        columns: ['resource', 'resourceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_userId_createdAt_idx_f726f04a',
        columns: ['userId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auditLog',
        index: 'auditLog_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auditLog',
        foreignKey: {
          name: 'auditLog_organizationId_fkey',
          columns: ['organizationId'],
          references: { schema: 'public', table: 'organization', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auditLog',
        foreignKey: {
          name: 'auditLog_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
