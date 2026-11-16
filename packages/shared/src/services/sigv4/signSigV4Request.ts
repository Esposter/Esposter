import type { SigV4Credentials } from "#src/models/sigv4/SigV4Credentials";
import type { SigV4Request } from "#src/models/sigv4/SigV4Request";

import { SIGV4_ALGORITHM, SIGV4_CONTENT_SHA256_HEADER, UNSIGNED_PAYLOAD } from "#src/services/sigv4/constants";
import { getAmzDate } from "#src/services/sigv4/getAmzDate";
import { getCanonicalRequest } from "#src/services/sigv4/getCanonicalRequest";
import { getCredentialScope } from "#src/services/sigv4/getCredentialScope";
import { getSigV4Signature } from "#src/services/sigv4/getSigV4Signature";

// The request's headers with its SigV4 `Authorization` added, signed now. Every header it carries is signed, so one the
// Runtime adds later (the length, the user agent) is left out. The payload is unsigned unless the request names its hash
export const signSigV4Request = async (
  credentials: SigV4Credentials,
  { headers: headersInit, method, signedAt = new Date(), url }: SigV4Request,
): Promise<Headers> => {
  const headers = new Headers(headersInit);
  const amzDate = getAmzDate(signedAt);
  headers.set("X-Amz-Date", amzDate);
  if (!headers.has(SIGV4_CONTENT_SHA256_HEADER)) headers.set(SIGV4_CONTENT_SHA256_HEADER, UNSIGNED_PAYLOAD);
  const { canonicalRequest, signedHeaders } = getCanonicalRequest(
    method,
    new URL(url),
    headers,
    headers.get(SIGV4_CONTENT_SHA256_HEADER) ?? UNSIGNED_PAYLOAD,
  );
  const signature = await getSigV4Signature(credentials, amzDate, canonicalRequest);
  headers.set(
    "Authorization",
    `${SIGV4_ALGORITHM} Credential=${credentials.accessKeyId}/${getCredentialScope(credentials, amzDate)}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  );
  return headers;
};
