import { BLOB_URL_SEARCH_REGEX } from "#shared/services/surveyer/constants";

export const extractBlobUrls = (model: string): string[] => [
  ...new Set(Array.from(model.matchAll(BLOB_URL_SEARCH_REGEX)).map(([blobUrl]) => blobUrl)),
];
