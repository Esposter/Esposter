import type { Resource, ResourceVersion } from "@esposter/db-schema";

// Where a version's content-addressed object lives. Scoped by resource rather than by owner: successive
// Versions of one document are where deduplication fires, the object has exactly one payer, and every path
// That already takes `{id}/` wholesale — purge, and the ledger release behind it — takes these with it.
// `objects` is a segment neither channel nor `files` claims, so `parseResourceAssetPath` never resolves one
export const getSnapshotObjectBlobName = (resourceId: Resource["id"], hash: ResourceVersion["hash"]) =>
  `${resourceId}/objects/${hash}`;
