import type { R2Transport } from "#src/models/cloudflare/R2Transport";

import { readR2Credential } from "#src/services/cloudflare/readR2Credential";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import { AwsClient } from "aws4fetch";

// The one signed transport to R2's S3 API, shared by the tooling's bucket clients and the cutover. Credentials are read from the
// Environment when it is made. `retries` overrides aws4fetch's own, so a streamed body (which can be sent once) can be given none
export const createR2Transport = ({ retries }: { retries?: number } = {}): R2Transport => {
  const client = new AwsClient({
    accessKeyId: readR2Credential("R2_ACCESS_KEY_ID"),
    region: "auto",
    secretAccessKey: readR2Credential("R2_SECRET_ACCESS_KEY"),
    service: "s3",
    ...(retries === undefined ? {} : { retries }),
  });
  return {
    endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    fetch: (url, init) => client.fetch(url, init),
  };
};
