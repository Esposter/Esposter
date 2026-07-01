import type { FlushOp } from "@/models/exec/FlushOp";

import { OVERLAY_APPLY_SCRIPT } from "@/services/exec/snapshot/constants";
import { runOverlayScript } from "@/services/exec/snapshot/runOverlayScript";
// Apply a flush plan onto a destination dir, reading copy payloads from `sourceDir` (specs/write-back.md). Direction-
// agnostic, which lets the task cache reuse it for persist (upper -> host), recording (upper -> payload), and replay
// (payload -> host). An empty plan is a no-op so no Linux-side process is spawned.
export const applyFlushPlan = (sourceDir: string, destinationDir: string, plan: readonly FlushOp[]): void => {
  if (plan.length > 0) runOverlayScript(OVERLAY_APPLY_SCRIPT, [sourceDir, destinationDir], JSON.stringify(plan));
};
