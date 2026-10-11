import type { CpuCapture } from "#src/models/genshinParity/shared/CpuCapture";
import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";
import type { GpuPass } from "#src/models/genshinParity/shared/GpuPass";

// Every GPU call of one run, and the animation frame times it was drawn against, so a call's frame index is its place there.
// With the run's main-thread samples, a frame with no GPU call in it is named by the code that held it, and with its passes
// Timed on the GPU, absent where the adapter has no timestamp queries, a frame waiting on the GPU by the work it waited on
export interface GpuTrace {
  calls: GpuCall[];
  cpu?: CpuCapture;
  passes?: GpuPass[];
  times: number[];
}
