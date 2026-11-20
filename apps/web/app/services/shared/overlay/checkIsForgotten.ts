import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { TOMBSTONE_RETENTION_MS } from "@esposter/db-schema";

// A tombstone held past the retention is forgotten, at the age the nightly purge removes it on the server. Once it is
// Forgotten nothing is held for its key, so a row the server revives at a lower version arrives as new
export const checkIsForgotten = (row: undefined | Versioned): boolean => {
  if (!row?.deletedAt) return false;

  return row.deletedAt.getTime() < Date.now() - TOMBSTONE_RETENTION_MS;
};
