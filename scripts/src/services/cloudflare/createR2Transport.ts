import type { R2Transport } from "#src/models/cloudflare/R2Transport";

import { R2_MAX_CONCURRENT_REQUESTS, R2_REQUEST_TIMEOUT_MS } from "#src/services/cloudflare/constants";
import { readR2Credential } from "#src/services/cloudflare/readR2Credential";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import { createSemaphore, createSigV4Fetch } from "@esposter/shared";

// One slot pool for every transport, so the dev and prod clients of a publish draw on the same connections
const runR2Request = createSemaphore(R2_MAX_CONCURRENT_REQUESTS);

// The one signed transport to R2's S3 API, shared by the tooling's bucket clients. Credentials are read from the
// Environment when it is made
export const createR2Transport = (): R2Transport => {
  const signedFetch = createSigV4Fetch({
    accessKeyId: readR2Credential("R2_ACCESS_KEY_ID"),
    region: "auto",
    secretAccessKey: readR2Credential("R2_SECRET_ACCESS_KEY"),
    service: "s3",
  });
  return {
    endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    // The timeout starts once a request holds its slot, so a request queued behind the others is not timed out unsent. A slot
    // Is released when the response's headers arrive, so a body read after that is not counted: the tooling reads back only
    // Small index and listing bodies
    fetch: (url, init) =>
      runR2Request(() => signedFetch(url, { ...init, signal: AbortSignal.timeout(R2_REQUEST_TIMEOUT_MS) })),
  };
};
