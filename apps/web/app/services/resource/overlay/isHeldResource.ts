import type { ResourceInResource } from "@esposter/db-schema";

// The overlay holds a resource as landed once a read or write has answered it. A client-created row has no version, and
// None is held as one, so a row without a version is not held
export const isHeldResource = <TRow extends { version?: number }>(row: TRow): row is ResourceInResource & TRow =>
  row.version !== undefined;
