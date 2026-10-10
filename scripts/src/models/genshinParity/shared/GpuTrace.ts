import type { CpuCapture } from "#src/models/genshinParity/shared/CpuCapture";
import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";

// Every GPU call of one run, and the animation frame times it was drawn against, so a call's frame index is its place there.
// With the run's main-thread samples, a frame with no GPU call in it is named by the code that held it
export interface GpuTrace {
  calls: GpuCall[];
  cpu?: CpuCapture;
  times: number[];
}
