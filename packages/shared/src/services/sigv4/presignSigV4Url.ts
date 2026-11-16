import type { SigV4Credentials } from "#src/models/sigv4/SigV4Credentials";
import type { SigV4Request } from "#src/models/sigv4/SigV4Request";

import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";
import { MAX_PRESIGNED_URL_EXPIRES_MS, SIGV4_ALGORITHM, UNSIGNED_PAYLOAD } from "#src/services/sigv4/constants";
import { getAmzDate } from "#src/services/sigv4/getAmzDate";
import { getCanonicalRequest } from "#src/services/sigv4/getCanonicalRequest";
import { getCredentialScope } from "#src/services/sigv4/getCredentialScope";
import { getSignedHeaders } from "#src/services/sigv4/getSignedHeaders";
import { getSigV4Signature } from "#src/services/sigv4/getSigV4Signature";

// A URL carrying its own SigV4 signature in the query, good for `expiresInMs` from now, so a browser can send the request
// With no credentials of its own. The headers given are signed, so the request must send them with those values; the
// Payload is unsigned
export const presignSigV4Url = async (
  credentials: SigV4Credentials,
  {
    expiresInMs,
    headers: headersInit,
    method,
    signedAt = new Date(),
    url: urlInput,
  }: SigV4Request & { expiresInMs: number },
): Promise<string> => {
  const expiresInSeconds = Math.floor(expiresInMs / 1000);
  if (expiresInSeconds < 1 || expiresInMs > MAX_PRESIGNED_URL_EXPIRES_MS)
    throw new InvalidOperationError(
      Operation.Create,
      "presigned url",
      `expires in ${expiresInMs} ms, outside 1 s to ${MAX_PRESIGNED_URL_EXPIRES_MS} ms`,
    );
  const url = new URL(urlInput);
  const headers = new Headers(headersInit);
  const amzDate = getAmzDate(signedAt);
  url.searchParams.set("X-Amz-Algorithm", SIGV4_ALGORITHM);
  url.searchParams.set("X-Amz-Credential", `${credentials.accessKeyId}/${getCredentialScope(credentials, amzDate)}`);
  url.searchParams.set("X-Amz-Date", amzDate);
  url.searchParams.set("X-Amz-Expires", String(expiresInSeconds));
  url.searchParams.set("X-Amz-SignedHeaders", getSignedHeaders(headers).join(";"));
  const { canonicalQuery, canonicalRequest } = getCanonicalRequest(method, url, headers, UNSIGNED_PAYLOAD);
  // The query is sent as it was signed: `URL` would write a space as `+` and leave `*` bare, which a server reading the
  // Query back by RFC 3986 signs differently
  url.search = `${canonicalQuery}&X-Amz-Signature=${await getSigV4Signature(credentials, amzDate, canonicalRequest)}`;
  return url.toString();
};
