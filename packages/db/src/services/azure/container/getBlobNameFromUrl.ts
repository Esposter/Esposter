import { getResult } from "@esposter/shared";

// A blob name is the decoded path suffix of a url. Serialized content is owner-authored, so it can carry a
// Hand-written url whose percent escapes are invalid (`100%off.png`) — that url yields no name and is skipped,
// Never failing the save or publish of everything else in the same document
export const getBlobNameFromUrl = (blobUrl: string, prefix: string): string | undefined =>
  getResult(() => decodeURIComponent(blobUrl.slice(prefix.length))).unwrapOr(undefined);
