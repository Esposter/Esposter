import type { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";

import { createBlobServiceClient } from "#src/services/cutover/azure/createBlobServiceClient";
import { createCoreExecutor } from "#src/services/cutover/cloudflare/d1/createCoreExecutor";
import { createR2Client } from "#src/services/cutover/cloudflare/r2/createR2Client";
import { getCopyBuckets } from "#src/services/cutover/getCopyBuckets";
import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { orderCoreTables } from "#src/services/cutover/core/orderCoreTables";
import { getR2BucketName } from "#src/services/cutover/getR2BucketName";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { checkTimestampUniqueIndexes } from "#src/services/cutover/verify/checkTimestampUniqueIndexes";
import { verifyBucketObjects } from "#src/services/cutover/verify/verifyBucketObjects";
import { verifyCoreTable } from "#src/services/cutover/verify/verifyCoreTable";
import { verifyForeignKeys } from "#src/services/cutover/verify/verifyForeignKeys";
import { verifyStorageLedger } from "#src/services/cutover/verify/verifyStorageLedger";

// Checks the copy against the source and fails on the first difference, naming its key. Nothing is written
export const runVerify = async (environment: CutoverEnvironment): Promise<void> => {
  const variables = readCutoverEnvironment();
  const source = createSourceClient(variables.SOURCE_DATABASE_URL);
  const executor = createCoreExecutor(variables);
  const client = createR2Client({
    accessKeyId: variables.R2_ACCESS_KEY_ID,
    accountId: variables.CLOUDFLARE_ACCOUNT_ID,
    secretAccessKey: variables.R2_SECRET_ACCESS_KEY,
  });
  for (const table of orderCoreTables(getCoreTables())) {
    await checkTimestampUniqueIndexes(source, table);
    console.info(`${table.name}: ${await verifyCoreTable(source, executor, table)} rows match`);
  }
  await source.end();
  await verifyForeignKeys(executor);
  const azure = createBlobServiceClient(variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING);
  const objectSizes = new Map<string, number>();
  for (const bucket of getCopyBuckets()) {
    const r2Bucket = getR2BucketName(environment, bucket);
    await verifyBucketObjects({ azure, bucket, client, r2Bucket });
    for await (const object of client.listObjects(r2Bucket)) objectSizes.set(`${bucket}/${object.key}`, object.size);
    console.info(`${bucket}: objects match`);
  }
  await verifyStorageLedger(executor, objectSizes);
};
