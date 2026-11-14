import type { CoreColumn } from "#src/models/cutover/CoreColumn";
import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";

import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { toD1Value } from "#src/services/cutover/core/toD1Value";
import { inviteTableName, tokenColumnsByTableName } from "#src/services/cutover/ids/credentialColumns";
import { isOldId } from "#src/services/cutover/ids/rewriteOldIds";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";

type SourceClient = ReturnType<typeof createSourceClient>;

// Gives every row of one Postgres table its new key: a UUID-keyed row a UUIDv7 built from its own createdAt (a row with no createdAt is given the
// time it is first seen, which the id map keeps), a bearer token the hash it is re-issued as, and an invite its fresh code. Only a table keyed
// by a single `id` has rows to give; the rest are referenced by their parents' keys and keep none of their own
export const assignCoreTableIds = async (source: SourceClient, table: CoreTable, idMap: IdMap): Promise<void> => {
  if (table.primaryKeyColumns.length !== 1 || table.primaryKeyColumns[0]?.name !== "id") return;

  const issuer = tokenColumnsByTableName.get(table.name)?.find(({ issues }) => issues);
  const createdAtColumn = table.columns.find(({ name }) => name === "createdAt");
  // The token is read from Postgres, where it still is readable; its D1 column holds the hash, so the Postgres column is named apart
  const tokenColumn: CoreColumn | undefined = issuer
    ? { dataType: "string", name: issuer.oldColumn, notNull: false }
    : undefined;
  const columns = [...table.primaryKeyColumns, ...[createdAtColumn, tokenColumn].flatMap((column) => column ?? [])];
  for await (const row of readKeysetRows({
    columns,
    dialect: "postgres",
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
    if (!isOldId(oldId)) continue;

    const createdAtMilliseconds = createdAtColumn ? toD1Value(createdAtColumn, row.createdAt) : null;
    const createdAt = typeof createdAtMilliseconds === "number" ? new Date(createdAtMilliseconds) : new Date();
    const oldToken = tokenColumn ? row[tokenColumn.name] : undefined;
    idMap.assignOldId(oldId, createdAt, typeof oldToken === "string" ? oldToken : undefined);
  }
};
