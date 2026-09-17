import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

// The stroke either ends the run — `develop` moved under it — or hands back the `develop` every later step
// Measures against: `main`'s head after a fast-forward, the sha it was read at otherwise
export interface ReturnStrokeResult {
  developSha: string;
  outcome?: CycleOutcome;
}
