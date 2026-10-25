import type { GpuPass } from "#src/models/genshinParity/shared/GpuPass";

// How long after its submit the GPU began a pass, against the run's quickest: the GPU's clock starts elsewhere than the
// Page's, so the least gap between the two is the one taken as no wait
export const getQueuedMs = ({ beginMs, submittedMs }: GpuPass, offsetMs: number): number =>
  beginMs - submittedMs - offsetMs;
