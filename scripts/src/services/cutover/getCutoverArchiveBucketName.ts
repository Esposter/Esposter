import type { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";

import { CUTOVER_ARCHIVE_PURPOSE } from "#src/services/cutover/constants";
import { getCloudflareEnvironment } from "#src/services/cutover/getCloudflareEnvironment";
import { CloudflareAssetType, getCloudflareResourceName } from "@esposter/db-schema";

// `<env>-r2-esposter-cutover-archive`: the private bucket holding checkpoints and snapshots until teardown
export const getCutoverArchiveBucketName = (environment: CutoverEnvironment) =>
  getCloudflareResourceName(
    getCloudflareEnvironment(environment),
    CloudflareAssetType.R2Bucket,
    CUTOVER_ARCHIVE_PURPOSE,
  );
