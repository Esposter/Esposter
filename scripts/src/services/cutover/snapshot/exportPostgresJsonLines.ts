import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { R2Client } from "#src/models/cutover/R2Client";

import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { toD1Value } from "#src/services/cutover/core/toD1Value";
import { encodeJsonLines } from "#src/services/cutover/snapshot/encodeJsonLines";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";

type SourceClient = ReturnType<typeof createSourceClient>;

// The snapshot's Postgres half when no `pg_dump` is on PATH: each table as JSON lines of its transformed rows, in key order
export const exportPostgresJsonLines = async (
  source: SourceClient,
  client: R2Client,
  archiveBucket: string,
  keyPrefix: string,
  table: CoreTable,
): Promise<void> => {
  const rows = readKeysetRows({
    columns: table.columns,
    dialect: "postgres",
    keyColumns: table.primaryKeyColumns,
    qualifiedTableName: `${quoteIdentifier(table.pgSchema)}.${quoteIdentifier(table.pgTable)}`,
    readPage: async ({ params, sql }) => source.unsafe<Record<string, unknown>[]>(sql, params),
  });
  const transformed = (async function* () {
    for await (const row of rows)
      yield Object.fromEntries(table.columns.map((column) => [column.name, toD1Value(column, row[column.name])]));
  })();
  await client.uploadMultipart(archiveBucket, `${keyPrefix}/core/${table.name}.jsonl`, encodeJsonLines(transformed));
};
