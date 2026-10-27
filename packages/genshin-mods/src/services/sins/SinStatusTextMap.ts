import type { SinStatus } from "../../../types";

// Why the band and the pane say so instead of fresh scores, for the statuses that have a reason to say
export const SinStatusTextMap: Partial<Record<SinStatus, string>> = {
  failed: "Last prompt not scored",
  "no-key": "Needs a TypeSafe key",
  "node-too-old": "Needs Node 22.13 or later",
};
