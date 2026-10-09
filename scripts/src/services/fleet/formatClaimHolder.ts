import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

// A holder as `machine/worker`, the form status and the messages name a claim's holder by
export const formatClaimHolder = (holder: ClaimHolder): string => `${holder.machine}/${holder.worker}`;
