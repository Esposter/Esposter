import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { D1Statement } from "#src/models/cutover/D1Statement";

import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { orderCoreTables } from "#src/services/cutover/core/orderCoreTables";
import { writeStatements } from "#src/services/cutover/core/writeStatements";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { rewriteBlobUrl } from "#src/services/cutover/urls/rewriteBlobUrl";
import { z } from "zod";

const BLOB_HOST_PATTERN = "%.blob.core.windows.net/%";
const d1KeyValueSchema = z.union([z.string(), z.number(), z.null()]);

// Rewrites every stored absolute Azure blob URL in an `image` column (a user's, a room's, a webhook app user's) to its public asset URL.
// Idempotent: a row already rewritten no longer matches the pattern
export const rewriteBlobUrls = async (executor: D1Executor, publicAssetsBaseUrl: string): Promise<number> => {
  const tables = orderCoreTables(getCoreTables()).filter((table) => table.columns.some(({ name }) => name === "image"));
  let rewritten = 0;
  for (const table of tables)
    // oxlint-disable-next-line no-await-in-loop -- committed prefix: a table is rewritten before the next is read, so a failure stops the tables behind it and a re-run reaches only the rows still holding a blob URL
    rewritten += await rewriteTableBlobUrls(executor, table, publicAssetsBaseUrl);
  return rewritten;
};

const rewriteTableBlobUrls = async (
  executor: D1Executor,
  table: CoreTable,
  publicAssetsBaseUrl: string,
): Promise<number> => {
  const updates = await getUpdates(executor, table, publicAssetsBaseUrl);
  await writeStatements(executor, updates);
  return updates.length;
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
        params: [next, ...table.primaryKeyColumns.map(({ name }) => d1KeyValueSchema.parse(row[name] ?? null))],
        sql: `UPDATE ${quoteIdentifier(table.name)} SET ${quoteIdentifier("image")} = ? WHERE ${table.primaryKeyColumns
          .map(({ name }) => `${quoteIdentifier(name)} = ?`)
          .join(" AND ")}`,
      },
    ];
  });
};
