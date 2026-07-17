import { useBlobUrlSearchRegex } from "@@/server/composables/resource/useBlobUrlSearchRegex";

export const extractBlobUrls = (serializedContent: string): string[] => [
  ...new Set(
    serializedContent.matchAll(useBlobUrlSearchRegex()).map(([blobUrl]) => {
      // We don't need the SAS token query parameters
      const queryParamIndex = blobUrl.indexOf("?");
      return decodeURIComponent(queryParamIndex === -1 ? blobUrl : blobUrl.slice(0, queryParamIndex));
    }),
  ),
];
