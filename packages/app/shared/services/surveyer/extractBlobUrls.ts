import { getBlobUrlSearchRegex } from "#shared/services/surveyer/getBlobUrlSearchRegex";

export const extractBlobUrls = (model: string): string[] => [
  ...new Set(
    Array.from(model.matchAll(getBlobUrlSearchRegex())).map(([blobUrl]) => {
      // We don't need the SAS token query parameters
      const queryParamIndex = blobUrl.indexOf("?");
      return decodeURIComponent(queryParamIndex === -1 ? blobUrl : blobUrl.substring(0, queryParamIndex));
    }),
  ),
];
