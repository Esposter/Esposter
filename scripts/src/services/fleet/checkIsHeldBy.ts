import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

// Whether a claim's message names `holder` as its worker on its machine, both fields matching
export const checkIsHeldBy = (message: ClaimHolder, holder: ClaimHolder): boolean =>
  message.machine === holder.machine && message.worker === holder.worker;
