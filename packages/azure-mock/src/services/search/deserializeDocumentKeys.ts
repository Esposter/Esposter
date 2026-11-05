import { deserializeKey } from "@esposter/azure";

// The index stores a composite key under its capitalized name, `PartitionKey` and `RowKey`, while a filter names the
// Property the key deserializes to. Reading a document under its property names lets one filter serve both
export const deserializeDocumentKeys = (document: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(document).map(([key, value]) => [deserializeKey(key), value]));
