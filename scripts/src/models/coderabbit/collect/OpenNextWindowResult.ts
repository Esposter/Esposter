import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

export interface OpenNextWindowResult {
  // Whether a window reached the remote — a dry run never does, so it ends the openings whatever it reports
  isWindowOpened: boolean;
  outcome: CycleOutcome;
}
