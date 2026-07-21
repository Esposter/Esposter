import { useBlobUrlSearchRegex } from "@@/server/composables/resource/useBlobUrlSearchRegex";
import { getBlobUrlWithoutSasQuery } from "@@/server/services/resource/getBlobUrlWithoutSasQuery";

// The url stays percent-encoded exactly as the content carries it, because callers search the content for it
// Verbatim — decoding is the blob name's business
export const extractBlobUrls = (serializedContent: string): string[] => [
  ...new Set(
    serializedContent.matchAll(useBlobUrlSearchRegex()).map(([blobUrl]) => getBlobUrlWithoutSasQuery(blobUrl)),
  ),
];
