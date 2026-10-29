import type { VerifyOutcome } from "#src/models/genshinParity/reference/VerifyOutcome";

// One reference's verdict from `verify`, with the reason or the measure it was judged by
export interface ReferenceVerification {
  id: string;
  message: string;
  outcome: VerifyOutcome;
}
