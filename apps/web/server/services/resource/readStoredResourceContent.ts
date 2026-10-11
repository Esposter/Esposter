import type { ResourceInResource } from "@esposter/db-schema";

import { readSerializedResourceContent } from "#server/services/resource/readSerializedResourceContent";

// The working copy as the JSON it was stored as, before any schema's parse, and null for a resource created and never
// Saved: the document a JSON Patch addresses, and an agent's first write replaces whole
export const readStoredResourceContent = async (id: ResourceInResource["id"]): Promise<unknown> => {
  const serializedContent = await readSerializedResourceContent(id);
  // oxlint-disable-next-line no-restricted-properties -- the stored JSON as written, its ISO strings left for a schema to read
  return serializedContent ? (JSON.parse(serializedContent) as unknown) : null;
};
