import type { R2Transport } from "#src/models/cloudflare/R2Transport";

import { readR2Credential } from "#src/services/cloudflare/readR2Credential";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import { createSigV4Fetch } from "@esposter/shared";

// The one signed transport to R2's S3 API, shared by the tooling's bucket clients. Credentials are read from the
// Environment when it is made
export const createR2Transport = (): R2Transport => ({
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  fetch: createSigV4Fetch({
    accessKeyId: readR2Credential("R2_ACCESS_KEY_ID"),
    region: "auto",
    secretAccessKey: readR2Credential("R2_SECRET_ACCESS_KEY"),
    service: "s3",
  }),
});
