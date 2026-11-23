import type { R2Transport } from "#src/models/cloudflare/R2Transport";
import type { CloudflareEnvironment } from "@esposter/db-schema";

import { R2_MAX_CONCURRENT_REQUESTS, R2_REQUEST_TIMEOUT_MS } from "#src/services/cloudflare/constants";
import { readR2Credential } from "#src/services/cloudflare/readR2Credential";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import { createSemaphore, createSigV4Fetch } from "@esposter/shared";

// One slot pool for every transport, so the dev and prod clients of a publish draw on the same connections
const runR2Request = createSemaphore(R2_MAX_CONCURRENT_REQUESTS);

// The signed transport to R2's S3 API for one environment's buckets. Its token is that environment's own, named `<env>_R2_*`,
// Since a token reaches only its environment's bucket, it is read from the environment when the transport is made
export const createR2Transport = (environment: CloudflareEnvironment): R2Transport => {
  const signedFetch = createSigV4Fetch({
    accessKeyId: readR2Credential(`${environment}_R2_ACCESS_KEY_ID`),
    region: "auto",
    secretAccessKey: readR2Credential(`${environment}_R2_SECRET_ACCESS_KEY`),
    service: "s3",
  });
  return {
    endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    // The timeout starts once a request holds its slot, so a request queued behind the others is not timed out unsent. A slot
    // Is released when the response's headers arrive, so a body read after that is not counted: a publish reads back the
    // Objects it stores or newly names, bodies up to the cap included, and MAX_CONCURRENT_VERIFY_FETCHES bounds those reads
    fetch: (url, init) =>
      runR2Request(() => signedFetch(url, { ...init, signal: AbortSignal.timeout(R2_REQUEST_TIMEOUT_MS) })),
  };
};
