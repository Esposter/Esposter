/* oxlint-disable no-await-in-loop -- committed prefix: each table's upload completes before the next starts, since each holds a 64 MB part in memory */
import type { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";

import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { listTableEntities } from "#src/services/cutover/azure/listTableEntities";
import { createR2Client } from "#src/services/cutover/cloudflare/r2/createR2Client";
import { ARCHIVE_SNAPSHOT_PREFIX } from "#src/services/cutover/constants";
import { getPostgresCoreTables } from "#src/services/cutover/core/getPostgresCoreTables";
import { getCutoverArchiveBucketName } from "#src/services/cutover/getCutoverArchiveBucketName";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { dumpPostgresToArchive } from "#src/services/cutover/snapshot/dumpPostgresToArchive";
import { encodeJsonLines } from "#src/services/cutover/snapshot/encodeJsonLines";
import { exportPostgresJsonLines } from "#src/services/cutover/snapshot/exportPostgresJsonLines";
import { hasPgDump } from "#src/services/cutover/snapshot/hasPgDump";
import { TableClient } from "@azure/data-tables";

// The archive before production is copied: the Postgres dump, or its JSON lines when no client tools are installed, and every Azure Table as JSON lines.
// The archive is kept until teardown
export const runSnapshot = async (environment: CutoverEnvironment): Promise<void> => {
  const variables = readCutoverEnvironment();
  const client = createR2Client();
  const archiveBucket = getCutoverArchiveBucketName(environment);
  const keyPrefix = `${ARCHIVE_SNAPSHOT_PREFIX}/${environment}`;
  if (await hasPgDump()) {
    await dumpPostgresToArchive(client, archiveBucket, `${keyPrefix}/postgres.dump`, variables.SOURCE_DATABASE_URL);
    console.info("postgres dumped with pg_dump");
  } else {
    const source = createSourceClient(variables.SOURCE_DATABASE_URL);
    for (const table of getPostgresCoreTables())
      await exportPostgresJsonLines(source, client, archiveBucket, keyPrefix, table);
    await source.end();
    console.info("postgres exported as JSON lines: pg_dump is not on PATH");
  }
  for (const tableName of Object.values(LegacyAzureTable)) {
    const tableClient = TableClient.fromConnectionString(variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING, tableName);
    await client.uploadMultipart(
      archiveBucket,
      `${keyPrefix}/azure/${tableName}.jsonl`,
      encodeJsonLines(listTableEntities(tableClient)),
    );
    console.info(`${tableName} exported`);
  }
};
