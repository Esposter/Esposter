import type { ExecResult } from "@/models/exec/ExecResult";
import type { SnapshotLocation } from "@/models/exec/snapshot/SnapshotLocation";
// The outcome of a capture run: where the warm snapshot was frozen plus the result of the command that
// Produced it. The capture run is a real execution, so on a cold cache its result is what the first fork
// Returns directly — no redundant second run over the frozen upper, so the command runs exactly once.
export interface SnapshotCapture {
  location: SnapshotLocation;
  result: ExecResult;
}
