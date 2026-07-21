import { useBlobUrlSearchRegex } from "@@/server/composables/resource/useBlobUrlSearchRegex";

export const extractBlobUrls = (serializedContent: string): string[] => [
  ...new Set(
    serializedContent.matchAll(useBlobUrlSearchRegex()).map(([blobUrl]) => {
      // We don't need the SAS token query parameters. The url stays percent-encoded exactly as the content
      // Carries it, because callers search the content for it verbatim — decoding is the blob name's business
      const queryParamIndex = blobUrl.indexOf("?");
      return queryParamIndex === -1 ? blobUrl : blobUrl.slice(0, queryParamIndex);
    }),
  ),
];
