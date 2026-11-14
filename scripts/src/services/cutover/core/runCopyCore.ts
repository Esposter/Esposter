/* oxlint-disable no-await-in-loop -- each step reads the last: the tables copy in foreign-key order and sync children first, so each waits for the one before it */
import type { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";

import { createCoreExecutor } from "#src/services/cutover/cloudflare/d1/createCoreExecutor";
import { createR2Client } from "#src/services/cutover/cloudflare/r2/createR2Client";
import { copyCoreTable } from "#src/services/cutover/core/copyCoreTable";
import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { orderCoreTables } from "#src/services/cutover/core/orderCoreTables";
import { syncCoreTableKeys } from "#src/services/cutover/core/syncCoreTableKeys";
import { getCloudflareEnvironment } from "#src/services/cutover/getCloudflareEnvironment";
import { getCutoverArchiveBucketName } from "#src/services/cutover/getCutoverArchiveBucketName";
import { loadIdMap } from "#src/services/cutover/ids/loadIdMap";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";

// Copies every Postgres table into `core` in foreign-key order, then drops the rows the source no longer holds, children first.
// Every row is written under the new id assign-ids gave it. Idempotent: a re-run upserts the same rows and removes the same extras
export const runCopyCore = async (cutoverEnvironment: CutoverEnvironment): Promise<void> => {
  const variables = readCutoverEnvironment();
  const source = createSourceClient(variables.SOURCE_DATABASE_URL);
  const cloudflareEnvironment = getCloudflareEnvironment(cutoverEnvironment);
  const executor = createCoreExecutor(cloudflareEnvironment, variables);
  const idMap = await loadIdMap(createR2Client(), getCutoverArchiveBucketName(cutoverEnvironment));
  const tables = orderCoreTables(getCoreTables());
  for (const table of tables)
    console.info(`${table.name}: ${await copyCoreTable(source, executor, table, idMap)} rows`);
  for (const table of tables.toReversed()) {
    const removed = await syncCoreTableKeys(source, executor, table, idMap);
    if (removed > 0) console.info(`${table.name}: removed ${removed} rows the source no longer holds`);
  }
  await source.end();
};
