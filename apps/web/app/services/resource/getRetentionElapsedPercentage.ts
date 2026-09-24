import type { Resource } from "@esposter/db-schema";

import { RECYCLE_BIN_RETENTION_MS } from "@esposter/db-schema";

// How much of its time in the bin a resource has used, out of a hundred: full once it is only awaiting the next sweep
export const getRetentionElapsedPercentage = (deletedAt: Resource["deletedAt"]): number => {
  if (!deletedAt) return 0;

  return Math.min(((Date.now() - deletedAt.getTime()) / RECYCLE_BIN_RETENTION_MS) * 100, 100);
};
