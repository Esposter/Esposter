import { getCopyBuckets } from "#src/services/cutover/getCopyBuckets";
import { InvalidOperationError, Operation } from "@esposter/shared";

const BLOB_HOST_SUFFIX = ".blob.core.windows.net";

// Rewrites an absolute Azure blob URL to the public asset route for its container's bucket, and returns undefined for any other string, which stays as it is.
// A blob URL naming a container that is not a bucket is refused, since it has no bucket to point at
export const rewriteBlobUrl = (value: string, publicAssetsBaseUrl: string): string | undefined => {
  if (!URL.canParse(value)) return undefined;
  const url = new URL(value);
  if (!url.hostname.endsWith(BLOB_HOST_SUFFIX)) return undefined;
  const [container = "", ...keySegments] = url.pathname.split("/").slice(1);
  if (!getCopyBuckets().some((bucket) => bucket === container) || keySegments.length === 0)
    throw new InvalidOperationError(
      Operation.Update,
      container,
      "is not a container with a bucket, so its URL has no target",
    );
  // The query string is a SAS token, which the public route never needs and the copy must not keep
  const key = keySegments.map((segment) => encodeURIComponent(decodeURIComponent(segment))).join("/");
  return `${publicAssetsBaseUrl.replace(/\/$/u, "")}/${container}/${key}`;
};
