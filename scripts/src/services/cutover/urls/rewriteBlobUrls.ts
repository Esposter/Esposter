import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { D1Statement } from "#src/models/cutover/D1Statement";

import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { orderCoreTables } from "#src/services/cutover/core/orderCoreTables";
import { writeStatements } from "#src/services/cutover/core/writeStatements";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { rewriteBlobUrl } from "#src/services/cutover/urls/rewriteBlobUrl";

const BLOB_HOST_PATTERN = "%.blob.core.windows.net/%";

// Rewrites every stored absolute Azure blob URL in an `image` column (a user's, a room's, a webhook app user's) to its
// public asset URL. Idempotent: a row already rewritten no longer matches the pattern
export const rewriteBlobUrls = async (executor: D1Executor, publicAssetsBaseUrl: string): Promise<number> => {
  const tables = orderCoreTables(getCoreTables()).filter((table) => table.columns.some(({ name }) => name === "image"));
  let rewritten = 0;
  for (const table of tables) {
    const updates = await getUpdates(executor, table, publicAssetsBaseUrl);
    rewritten += updates.length;
    await writeStatements(executor, updates);
  }
  return rewritten;
};

const getUpdates = async (
  executor: D1Executor,
  table: CoreTable,
  publicAssetsBaseUrl: string,
): Promise<D1Statement[]> => {
  const keyNames = table.primaryKeyColumns.map(({ name }) => quoteIdentifier(name));
  const rows = await executor.query({
    params: [BLOB_HOST_PATTERN],
    sql: `SELECT ${[...keyNames, quoteIdentifier("image")].join(", ")} FROM ${quoteIdentifier(table.name)} WHERE ${quoteIdentifier("image")} LIKE ?`,
  });
  return rows.flatMap((row) => {
    const image = row.image;
    const next = typeof image === "string" ? rewriteBlobUrl(image, publicAssetsBaseUrl) : undefined;
    if (next === undefined || next === image) return [];
    return [
      {
        params: [next, ...table.primaryKeyColumns.map(({ name }) => row[name] ?? null)],
        sql: `UPDATE ${quoteIdentifier(table.name)} SET ${quoteIdentifier("image")} = ? WHERE ${table.primaryKeyColumns
          .map(({ name }) => `${quoteIdentifier(name)} = ?`)
          .join(" AND ")}`,
      },
    ];
  });
};
