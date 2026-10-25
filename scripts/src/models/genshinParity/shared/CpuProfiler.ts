import type { CpuCapture } from "#src/models/genshinParity/shared/CpuCapture";

export interface CpuProfiler {
  stop: () => Promise<CpuCapture>;
}
