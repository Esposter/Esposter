import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";

// Every GPU call of one run, and the animation frame times it was drawn against, so a call's frame index is its place there
export interface GpuTrace {
  calls: GpuCall[];
  times: number[];
}
