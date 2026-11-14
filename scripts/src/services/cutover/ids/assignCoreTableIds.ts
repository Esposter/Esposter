import type { CoreColumn } from "#src/models/cutover/CoreColumn";
import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { SourceClient } from "#src/models/cutover/SourceClient";

import { SqlDialect } from "#src/models/cutover/SqlDialect";
import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { toD1Value } from "#src/services/cutover/core/toD1Value";
import { inviteTableName, tableNameTokenColumnsMap } from "#src/services/cutover/ids/credentialColumns";
import { checkIsOldId } from "#src/services/cutover/ids/rewriteOldIds";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";

// Gives every row of one Postgres table its new key. A UUID-keyed row gets a UUIDv7 built from its own createdAt.
// A row with no createdAt gets the time it is first seen, which the id map keeps. A bearer token gets the hash it is re-issued as.
// An invite gets its fresh code. Only a table keyed by a single `id` has rows to give; the rest are referenced by their parents' keys and keep none of their own
export const assignCoreTableIds = async (source: SourceClient, table: CoreTable, idMap: IdMap): Promise<void> => {
  if (table.primaryKeyColumns.length !== 1 || table.primaryKeyColumns[0]?.name !== "id") return;

  const issuer = tableNameTokenColumnsMap.get(table.name)?.find(({ issues }) => issues);
  const createdAtColumn = table.columns.find(({ name }) => name === "createdAt");
  // The token is read from Postgres, where it still is readable; its D1 column holds the hash, so the Postgres column is named apart
  const tokenColumn: CoreColumn | undefined = issuer
    ? { dataType: "string", name: issuer.oldColumn, notNull: false }
    : undefined;
  const columns = [...table.primaryKeyColumns, ...[createdAtColumn, tokenColumn].flatMap((column) => column ?? [])];
  for await (const row of readKeysetRows({
    columns,
    dialect: SqlDialect.Postgres,
    keyColumns: table.primaryKeyColumns,
    qualifiedTableName: `${quoteIdentifier(table.pgSchema)}.${quoteIdentifier(table.pgTable)}`,
    readPage: async ({ params, sql }) => source.unsafe<Record<string, unknown>[]>(sql, params),
  })) {
    const oldId = row.id;
    if (typeof oldId !== "string") continue;
    if (table.name === inviteTableName) {
      idMap.assignInviteCode(oldId);
      continue;
    }
    if (!checkIsOldId(oldId)) continue;

    const createdAtMilliseconds = createdAtColumn ? toD1Value(createdAtColumn, row.createdAt) : null;
    const createdAt = typeof createdAtMilliseconds === "number" ? new Date(createdAtMilliseconds) : new Date();
    const oldToken = tokenColumn ? row[tokenColumn.name] : undefined;
    idMap.assignOldId(oldId, createdAt, typeof oldToken === "string" ? oldToken : undefined);
  }
};
