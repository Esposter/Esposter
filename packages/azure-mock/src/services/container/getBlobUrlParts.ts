import { getResult, takeOne } from "@esposter/shared";
// The container and blob a blob url addresses, or undefined when it names no blob (fewer than two path segments).
// Expected format: https://account.blob.core.windows.net/container/blob-name
//
// The `URL` constructor percent-encodes the pathname while the store is keyed by decoded blob names (real Azure
// Decodes the request target the same way), so the segments are decoded here — every caller looks a blob up by the
// Result, and a caller that skipped this would silently miss every blob whose name carries a space or `#`.
//
// A segment that is not valid percent-encoding keeps its raw form rather than throwing. Callers pass urls this
// Module did not build, so a name holding a lone `%` (`100%.png` — legal in a blob name) can reach
// `decodeURIComponent` as malformed input, and a throw would reject a caller's whole batch rather than the one
// Blob it names.
const decodeSegment = (segment: string) => getResult(() => decodeURIComponent(segment)).unwrapOr(segment);

export const getBlobUrlParts = (url: string): undefined | { blobName: string; containerName: string } => {
  // A string `URL` cannot parse is exactly what the `undefined` result means, so it is returned rather than thrown:
  // `deleteBlobs` maps `undefined` to an `InvalidUri` sub-response for the one url that names it, and a throw here
  // Would instead reject the caller's whole batch — the same failure the decode guard above exists to prevent.
  const parsedUrl = getResult(() => new URL(url)).unwrapOr(undefined);
  if (!parsedUrl) return undefined;
  const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
  if (pathSegments.length < 2) return undefined;
  return {
    blobName: decodeSegment(pathSegments.slice(1).join("/")),
    containerName: decodeSegment(takeOne(pathSegments)),
  };
};
