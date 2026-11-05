import { ASSET_HASH_TOKEN_REGEX } from "#shared/services/resource/constants";

// The content addresses a serialized document carries, each taken wherever it occurs as a whole token: a url's last
// Segment, a bare id an element stores, or a string a future shape holds. The scan reads no schema, so it misses no
// Shape. Release reads no document, so the scan runs where each document is written and the rows that write takes
// Carry its result
export const getSnapshotAssetHashes = (serializedContent: string): Set<string> =>
  new Set(Array.from(serializedContent.matchAll(ASSET_HASH_TOKEN_REGEX), (match) => match[0]));
