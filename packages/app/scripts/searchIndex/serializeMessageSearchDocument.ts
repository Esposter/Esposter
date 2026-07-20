import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db-schema";

import { serializeKey } from "@esposter/db";

// The inverse of `server/services/message/deserializeMessageSearchDocument.ts`: a search document is the table
// Entity under serialized keys, so uploading one is a rename of the keys serializeKey capitalizes. A runtime key
// Rename is the part the compiler cannot follow — Object.fromEntries types it as a bare Record, which overlaps
// No entity class — so the shape is restated as the document type the index itself pins.
export const serializeMessageSearchDocument = (
  message: SearchIndexDocumentMap[SearchIndex.Messages],
): SearchIndexDocumentMap[SearchIndex.Messages] =>
  Object.fromEntries(
    Object.entries(message).map(([key, value]) => [serializeKey(key), value]),
  ) as unknown as SearchIndexDocumentMap[SearchIndex.Messages];
