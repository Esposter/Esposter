import { useBlobUrlSearchRegex } from "@@/server/composables/survey/useBlobUrlSearchRegex";

export const extractBlobUrls = (model: string): string[] => [
  ...new Set(
    [...model.matchAll(useBlobUrlSearchRegex())].map(([blobUrl]) => {
      // We don't need the SAS token query parameters
      const queryParamIndex = blobUrl.indexOf("?");
      return decodeURIComponent(queryParamIndex === -1 ? blobUrl : blobUrl.slice(0, queryParamIndex));
    }),
  ),
];
