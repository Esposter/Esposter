import type { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { R2Client } from "#src/models/cutover/R2Client";

import { getCopyBuckets } from "#src/services/cutover/getCopyBuckets";
import { getR2BucketName } from "#src/services/cutover/getR2BucketName";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { storageLedgerInStorage } from "@esposter/db-schema";
import { getTableConfig } from "drizzle-orm/sqlite-core";

// A textual blob the copy rewrote is stored at a size its old ledger row never counted, so each reconciled row is charged
// The bytes its object holds now, as the app's own reconcile measures them. A row whose object is missing keeps its count,
// Which verify then reports. Re-running it changes nothing it already changed
export const chargeStoredSizes = async (
  executor: D1Executor,
  client: R2Client,
  environment: CutoverEnvironment,
): Promise<number> => {
  const objectSizes = new Map<string, number>();
  for (const bucket of getCopyBuckets())
    // oxlint-disable-next-line no-await-in-loop -- each bucket's listing is one paged walk, and they are read one after another
    for await (const object of client.listObjects(getR2BucketName(environment, bucket)))
      objectSizes.set(`${bucket}/${object.key}`, object.size);
  const table = quoteIdentifier(getTableConfig(storageLedgerInStorage).name);
  const rows = await executor.query({
    params: [],
    sql: `SELECT "containerName", "blobName", "countedBytes" FROM ${table} WHERE "reconciledAt" IS NOT NULL`,
  });
  const statements = rows.flatMap(({ blobName, containerName, countedBytes }) => {
    const size = objectSizes.get(`${String(containerName)}/${String(blobName)}`);
    return size === undefined || size === Number(countedBytes)
      ? []
      : [
          {
            params: [size, String(containerName), String(blobName)],
            sql: `UPDATE ${table} SET "countedBytes" = ? WHERE "containerName" = ? AND "blobName" = ?`,
          },
        ];
  });
  if (statements.length > 0) await executor.batch(statements);
  return statements.length;
};
