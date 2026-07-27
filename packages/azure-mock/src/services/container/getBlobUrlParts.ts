import { takeOne } from "@esposter/shared";
// The container and blob a blob url addresses, or undefined when it names no blob (fewer than two path segments).
// Expected format: https://account.blob.core.windows.net/container/blob-name
//
// The `URL` constructor percent-encodes the pathname while the store is keyed by decoded blob names (real Azure
// Decodes the request target the same way), so the segments are decoded here — every caller looks a blob up by the
// Result, and a caller that skipped this would silently miss every blob whose name carries a space, `#` or `%`.
export const getBlobUrlParts = (url: string): undefined | { blobName: string; containerName: string } => {
  const pathSegments = new URL(url).pathname.split("/").filter(Boolean);
  if (pathSegments.length < 2) return undefined;
  return {
    blobName: decodeURIComponent(pathSegments.slice(1).join("/")),
    containerName: decodeURIComponent(takeOne(pathSegments)),
  };
};
