import type { SinStatus } from "../../../types";

import { SinStatusKind } from "../../models/SinStatusKind";

// Why the band and the pane say so instead of fresh scores, for the statuses that have a reason to say
export const SinStatusTextMap: Partial<Record<SinStatus, string>> = {
  [SinStatusKind.Failed]: "Last prompt not scored",
  [SinStatusKind.NodeTooOld]: "Needs Node 22.13 or later on 22, or 23.4 or later on 23",
  [SinStatusKind.NoKey]: "Needs a TypeSafe key",
};
