import { decodeSegment } from "#src/services/container/decodeSegment";
import { getResult, takeOne } from "@esposter/shared";

// The container and blob a blob url addresses, or undefined when it names no blob (fewer than two path segments).
// Expected format: https://account.blob.core.windows.net/container/blob-name
export const getBlobUrlParts = (url: string): undefined | { blobName: string; containerName: string } => {
  // A string `URL` cannot parse is exactly what the `undefined` result means, so it is returned rather than thrown:
  // `deleteBlobs` maps `undefined` to an `InvalidUri` sub-response for the one url that names it, and a throw here
  // Would instead reject the caller's whole batch — the same failure the decode guard in decodeSegment exists to prevent.
  const parsedUrl = getResult(() => new URL(url)).unwrapOr(undefined);
  if (!parsedUrl) return undefined;
  const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
  if (pathSegments.length < 2) return undefined;
  return {
    blobName: pathSegments.slice(1).map(decodeSegment).join("/"),
    containerName: decodeSegment(takeOne(pathSegments)),
  };
};
