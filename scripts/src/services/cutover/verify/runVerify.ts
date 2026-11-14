/* oxlint-disable no-await-in-loop -- stop at the first: buckets run one after another so a failure names the bucket it stopped in, as copy-objects does */
import type { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";

import { createCoreExecutor } from "#src/services/cutover/cloudflare/d1/createCoreExecutor";
import { createR2Client } from "#src/services/cutover/cloudflare/r2/createR2Client";
import { COPY_CONCURRENCY } from "#src/services/cutover/constants";
import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { orderCoreTables } from "#src/services/cutover/core/orderCoreTables";
import { getCloudflareEnvironment } from "#src/services/cutover/getCloudflareEnvironment";
import { getCopyBuckets } from "#src/services/cutover/getCopyBuckets";
import { getCutoverArchiveBucketName } from "#src/services/cutover/getCutoverArchiveBucketName";
import { getR2BucketName } from "#src/services/cutover/getR2BucketName";
import { loadIdMap } from "#src/services/cutover/ids/loadIdMap";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { requireEnvironmentVariable } from "#src/services/cutover/requireEnvironmentVariable";
import { readTableParents } from "#src/services/cutover/tables/readTableParents";
import { checkTimestampUniqueIndexes } from "#src/services/cutover/verify/checkTimestampUniqueIndexes";
import { verifyBucketObjects } from "#src/services/cutover/verify/verifyBucketObjects";
import { verifyCoreTable } from "#src/services/cutover/verify/verifyCoreTable";
import { verifyForeignKeys } from "#src/services/cutover/verify/verifyForeignKeys";
import { verifyOldIds } from "#src/services/cutover/verify/verifyOldIds";
import { verifyRoomMessages } from "#src/services/cutover/verify/verifyRoomMessages";
import { verifyStorageLedger } from "#src/services/cutover/verify/verifyStorageLedger";
import { verifyTypedTables } from "#src/services/cutover/verify/verifyTypedTables";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { BlobServiceClient } from "@azure/storage-blob";

// Checks the copy against the source and fails on the first difference, naming its key. Nothing is written
export const runVerify = async (environment: CutoverEnvironment): Promise<void> => {
  const variables = readCutoverEnvironment();
  const source = createSourceClient(variables.SOURCE_DATABASE_URL);
  const cloudflareEnvironment = getCloudflareEnvironment(environment);
  const executor = createCoreExecutor(cloudflareEnvironment, variables);
  const client = createR2Client();
  const idMap = await loadIdMap(client, getCutoverArchiveBucketName(environment));
  await forEachConcurrently(orderCoreTables(getCoreTables()), COPY_CONCURRENCY, async (table) => {
    await checkTimestampUniqueIndexes(source, table);
    console.info(`${table.name}: ${await verifyCoreTable(source, executor, table, idMap)} rows match`);
  });
  await source.end();
  await verifyOldIds(executor, idMap);
  await verifyForeignKeys(executor);
  await verifyTypedTables({ connectionString: variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING, executor, idMap });
  await verifyRoomMessages({
    connectionString: variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING,
    functionsUrl: requireEnvironmentVariable("CUTOVER_FUNCTIONS_URL"),
    idMap,
    parents: await readTableParents(executor),
    secret: requireEnvironmentVariable("CUTOVER_SECRET"),
  });
  const azure = BlobServiceClient.fromConnectionString(variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING);
  const objectSizes = new Map<string, number>();
  for (const bucket of getCopyBuckets()) {
    const r2Bucket = getR2BucketName(environment, bucket);
    await verifyBucketObjects({ azure, bucket, client, idMap, r2Bucket });
    for await (const object of client.listObjects(r2Bucket)) objectSizes.set(`${bucket}/${object.key}`, object.size);
    console.info(`${bucket}: objects match`);
  }
  await verifyStorageLedger(executor, objectSizes);
};
