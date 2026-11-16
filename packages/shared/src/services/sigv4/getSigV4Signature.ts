import type { SigV4Credentials } from "#src/models/sigv4/SigV4Credentials";

import { SIGV4_ALGORITHM, SIGV4_SCOPE_TERMINATOR } from "#src/services/sigv4/constants";
import { getCredentialScope } from "#src/services/sigv4/getCredentialScope";
import { hmacSha256 } from "#src/services/sigv4/hmacSha256";

// Signs a canonical request: a key derived from the secret for the scope's day, region and service, one HMAC after
// Another, signs the string naming the algorithm, the time, the scope and the canonical request's hash
export const getSigV4Signature = async (
  { region, secretAccessKey, service }: SigV4Credentials,
  amzDate: string,
  canonicalRequest: string,
): Promise<string> => {
  const canonicalRequestHash = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalRequest)),
  ).toHex();
  const stringToSign = [
    SIGV4_ALGORITHM,
    amzDate,
    getCredentialScope({ region, service }, amzDate),
    canonicalRequestHash,
  ].join("\n");
  const dateKey = await hmacSha256(`AWS4${secretAccessKey}`, amzDate.slice(0, 8));
  const regionKey = await hmacSha256(dateKey, region);
  const serviceKey = await hmacSha256(regionKey, service);
  const signingKey = await hmacSha256(serviceKey, SIGV4_SCOPE_TERMINATOR);
  return new Uint8Array(await hmacSha256(signingKey, stringToSign)).toHex();
};
