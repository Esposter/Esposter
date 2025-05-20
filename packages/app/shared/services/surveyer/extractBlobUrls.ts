import { getBlobUrlSearchRegex } from "#shared/services/surveyer/getBlobUrlSearchRegex";

export const extractBlobUrls = (model: string): string[] => [
  ...new Set(Array.from(model.matchAll(getBlobUrlSearchRegex())).map(([blobUrl]) => decodeURIComponent(blobUrl))),
];
