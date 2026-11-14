import { createBlobServiceClient } from "#src/services/cutover/azure/createBlobServiceClient";
import { createTableClient } from "#src/services/cutover/azure/createTableClient";
import { countEntitiesByPartition } from "#src/services/cutover/azure/countEntitiesByPartition";
import { listContainerBlobs } from "#src/services/cutover/azure/listContainerBlobs";
import { ESTIMATE_BYTES_PER_SECOND, ESTIMATE_ROWS_PER_SECOND } from "#src/services/cutover/constants";
import { getCopyBuckets } from "#src/services/cutover/getCopyBuckets";
import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { StreamTable } from "@esposter/db-schema";

// Counts what the copy moves and estimates its duration from assumed throughputs. The rehearsal measures the real rates.
// Writes nothing anywhere
export const runInventory = async (): Promise<void> => {
  const variables = readCutoverEnvironment();
  const source = createSourceClient(variables.SOURCE_DATABASE_URL);
  let rowCount = 0;
  const core: Record<string, number> = {};
  for (const table of getCoreTables()) {
    const [result] = await source.unsafe<{ count: string }[]>(
      `SELECT count(*) AS count FROM ${quoteIdentifier(table.pgSchema)}.${quoteIdentifier(table.pgTable)}`,
    );
    const count = Number(result?.count ?? 0);
    core[table.name] = count;
    rowCount += count;
  }
  await source.end();
  const entities: Record<string, number> = {};
  for (const tableName of Object.values(StreamTable)) {
    const counts = await countEntitiesByPartition(
      createTableClient(variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING, tableName),
    );
    const count = [...counts.values()].reduce((total, partitionCount) => total + partitionCount, 0);
    entities[tableName] = count;
    rowCount += count;
  }
  const azure = createBlobServiceClient(variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING);
  const buckets: Record<string, { bytes: number; objects: number }> = {};
  let totalBytes = 0;
  for (const bucket of getCopyBuckets()) {
    const summary = { bytes: 0, objects: 0 };
    for await (const blob of listContainerBlobs(azure.getContainerClient(bucket))) {
      summary.objects += 1;
      summary.bytes += blob.size;
    }
    buckets[bucket] = summary;
    totalBytes += summary.bytes;
  }
  const estimatedSeconds = Math.ceil(totalBytes / ESTIMATE_BYTES_PER_SECOND + rowCount / ESTIMATE_ROWS_PER_SECOND);
  console.info(JSON.stringify({ buckets, core, entities, estimatedSeconds }, null, 2));
};
