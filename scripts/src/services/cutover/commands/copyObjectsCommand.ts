import type { SubCommandsDef } from "citty";

import { createR2Client } from "#src/services/cutover/cloudflare/r2/createR2Client";
import { environmentArgs } from "#src/services/cutover/commands/environmentArgs";
import { getCopyBuckets } from "#src/services/cutover/getCopyBuckets";
import { getCutoverArchiveBucketName } from "#src/services/cutover/getCutoverArchiveBucketName";
import { getR2BucketName } from "#src/services/cutover/getR2BucketName";
import { loadIdMap } from "#src/services/cutover/ids/loadIdMap";
import { copyBucketObjects } from "#src/services/cutover/objects/copyBucketObjects";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { BlobServiceClient } from "@azure/storage-blob";
import { defineCommand } from "citty";

export const copyObjectsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    ...environmentArgs,
    delta: {
      default: false,
      description:
        "Copy what changed since the full copy began, and delete what Azure no longer lists, during the freeze",
      type: "boolean",
    },
  },
  meta: {
    description:
      "Copy every blob container into its R2 bucket with its content type and disposition, skipping objects already stored with the same MD5",
    name: "copy-objects",
  },
  run: async ({ args }) => {
    const variables = readCutoverEnvironment();
    const client = createR2Client();
    const azure = BlobServiceClient.fromConnectionString(variables.SOURCE_AZURE_STORAGE_CONNECTION_STRING);
    const archiveBucket = getCutoverArchiveBucketName(args.environment);
    const idMap = await loadIdMap(client, archiveBucket);
    for (const bucket of getCopyBuckets()) {
      const r2Bucket = getR2BucketName(args.environment, bucket);
      // oxlint-disable-next-line no-await-in-loop -- Buckets run one after another so a failure names the bucket it stopped in; objects within one run together
      const counts = await copyBucketObjects({
        archiveBucket,
        azure,
        bucket,
        client,
        delta: args.delta,
        idMap,
        r2Bucket,
      });
      console.log(`${bucket}: copied ${counts.copied}, skipped ${counts.skipped}, deleted ${counts.deleted}`);
    }
  },
});
