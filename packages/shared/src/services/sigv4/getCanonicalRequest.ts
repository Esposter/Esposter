import { encodeSigV4Component } from "#src/services/sigv4/encodeSigV4Component";
import { getSignedHeaders } from "#src/services/sigv4/getSignedHeaders";

// SigV4 sorts by code unit, not by locale
const compareCodeUnits = (first: string, second: string): number => (first < second ? -1 : first > second ? 1 : 0);

// SigV4's canonical request, its query and the names of the headers it signs. S3 signs a path as it is: each segment is decoded
// From the URL and encoded once, never normalised. The query is sorted by encoded name, then value, and every header
// The request carries is signed with its value trimmed and its runs of spaces collapsed, the host among them
export const getCanonicalRequest = (
  method: string,
  url: URL,
  headers: Headers,
  payloadHash: string,
): { canonicalQuery: string; canonicalRequest: string; signedHeaders: string } => {
  const canonicalUri = url.pathname
    .split("/")
    .map((segment) => encodeSigV4Component(decodeURIComponent(segment)))
    .join("/");
  const canonicalQuery = [...url.searchParams]
    .filter(([name]) => name !== "")
    .map(([name, value]) => [encodeSigV4Component(name), encodeSigV4Component(value)] as const)
    .toSorted(([firstName, firstValue], [secondName, secondValue]) =>
      firstName === secondName ? compareCodeUnits(firstValue, secondValue) : compareCodeUnits(firstName, secondName),
    )
    .map(([name, value]) => `${name}=${value}`)
    .join("&");
  const signedHeaderNames = getSignedHeaders(headers);
  const signedHeaders = signedHeaderNames.join(";");
  return {
    canonicalQuery,
    canonicalRequest: [
      method.toUpperCase(),
      canonicalUri,
      canonicalQuery,
      signedHeaderNames
        .map(
          (name) =>
            `${name}:${name === "host" ? url.host : (headers.get(name) ?? "").trim().replaceAll(/\s+/gu, " ")}\n`,
        )
        .join(""),
      signedHeaders,
      payloadHash,
    ].join("\n"),
    signedHeaders,
  };
};
