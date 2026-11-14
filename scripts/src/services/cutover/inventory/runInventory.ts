import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { countEntitiesByPartition } from "#src/services/cutover/azure/countEntitiesByPartition";
import { listContainerBlobs } from "#src/services/cutover/azure/listContainerBlobs";
import { ESTIMATE_BYTES_PER_SECOND, ESTIMATE_ROWS_PER_SECOND } from "#src/services/cutover/constants";
import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { getCopyBuckets } from "#src/services/cutover/getCopyBuckets";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { TableClient } from "@azure/data-tables";
import { BlobServiceClient } from "@azure/storage-blob";

// Counts what the copy moves and estimates its duration from assumed throughputs.
// The rehearsal measures the real rates. Writes nothing anywhere
export const runInventory = async (): Promise<void> => {
  const variables = readCutoverEnvironment();
  const source = createSourceClient(variables.SOURCE_DATABASE_URL);
  const coreCounts = await Promise.all(
    getCoreTables().map(async (table) => {
      const [result] = await source.unsafe<{ count: string }[]>(
        `SELECT count(*) AS count FROM ${quoteIdentifier(table.pgSchema)}.${quoteIdentifier(table.pgTable)}`,
      );
      return { count: Number(result?.count ?? 0), name: table.name };
    }),
  );
  await source.end();
  const entityCounts = await Promise.all(
    Object.values(LegacyAzureTable).map(async (tableName) => {
      const counts = await countEntitiesByPartition(
        TableClient.fromConnectionString(variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING, tableName),
      );
      const count = [...counts.values()].reduce((total, partitionCount) => total + partitionCount, 0);
      return { count, name: tableName };
    }),
  );
  const azure = BlobServiceClient.fromConnectionString(variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING);
  const bucketSummaries = await Promise.all(
    getCopyBuckets().map(async (bucket) => {
      const summary = { bytes: 0, objects: 0 };
      for await (const blob of listContainerBlobs(azure.getContainerClient(bucket))) {
        summary.objects += 1;
        summary.bytes += blob.size;
      }
      return { name: bucket, summary };
    }),
  );
  const core = Object.fromEntries(coreCounts.map(({ count, name }): [string, number] => [name, count]));
  const entities = Object.fromEntries(entityCounts.map(({ count, name }): [string, number] => [name, count]));
  const buckets = Object.fromEntries(
    bucketSummaries.map(({ name, summary }): [string, { bytes: number; objects: number }] => [name, summary]),
  );
  const totalBytes = bucketSummaries.reduce((total, { summary }) => total + summary.bytes, 0);
  const rowCount = [...coreCounts, ...entityCounts].reduce((total, { count }) => total + count, 0);
  const estimatedSeconds = Math.ceil(totalBytes / ESTIMATE_BYTES_PER_SECOND + rowCount / ESTIMATE_ROWS_PER_SECOND);
  console.info(JSON.stringify({ buckets, core, entities, estimatedSeconds }, null, 2));
};
