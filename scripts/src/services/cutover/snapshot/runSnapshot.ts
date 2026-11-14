import type { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";

import { ARCHIVE_SNAPSHOT_PREFIX } from "#src/services/cutover/constants";
import { createR2Client } from "#src/services/cutover/cloudflare/r2/createR2Client";
import { createTableClient } from "#src/services/cutover/azure/createTableClient";
import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { getCutoverArchiveBucketName } from "#src/services/cutover/getCutoverArchiveBucketName";
import { listTableEntities } from "#src/services/cutover/azure/listTableEntities";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { dumpPostgresToArchive } from "#src/services/cutover/snapshot/dumpPostgresToArchive";
import { encodeJsonLines } from "#src/services/cutover/snapshot/encodeJsonLines";
import { exportPostgresJsonLines } from "#src/services/cutover/snapshot/exportPostgresJsonLines";
import { hasPgDump } from "#src/services/cutover/snapshot/hasPgDump";
import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";

// The archive before production is copied: the Postgres dump (or its JSON lines when no client tools are installed) and
// every Azure Table as JSON lines, kept until teardown
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
    for (const table of getCoreTables()) await exportPostgresJsonLines(source, client, archiveBucket, keyPrefix, table);
    await source.end();
    console.info("postgres exported as JSON lines: pg_dump is not on PATH");
  }
  for (const tableName of Object.values(LegacyAzureTable)) {
    const tableClient = createTableClient(variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING, tableName);
    await client.uploadMultipart(
      archiveBucket,
      `${keyPrefix}/azure/${tableName}.jsonl`,
      encodeJsonLines(listTableEntities(tableClient)),
    );
    console.info(`${tableName} exported`);
  }
};
