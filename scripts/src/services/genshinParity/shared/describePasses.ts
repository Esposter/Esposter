import type { GpuPass } from "#src/models/genshinParity/shared/GpuPass";

import { getQueuedMs } from "#src/services/genshinParity/shared/getQueuedMs";
import { roundMs } from "#src/services/genshinParity/shared/roundMs";
import { computeMedian } from "#src/services/recreation/statistics/computeMedian";

// The passes a state lists by their GPU time, and the frames before a stall whose passes it reads, since a stall waits
// On work the GPU took in earlier
const LISTED_PASSES_PER_STATE = 6;

// A state's passes by the GPU's own clock: their time a frame and how long the GPU left each queued after its submit, at
// The median and at most, then the passes that took the most of it, each kind of pass by its encoder and attachment
export const describePasses = (passes: GpuPass[], offsetMs: number): string[] => {
  const frameGpuMsMap = new Map<number, number>();
  for (const { frame, gpuMs } of passes) frameGpuMsMap.set(frame, (frameGpuMsMap.get(frame) ?? 0) + gpuMs);
  const frameGpuMs = [...frameGpuMsMap.values()];
  const queuedMs = passes.map((pass) => getQueuedMs(pass, offsetMs));
  const kinds = new Map<string, { count: number; maxMs: number; ms: number }>();
  for (const { detail, gpuMs, label } of passes) {
    const key = `${label} | ${detail}`;
    const total = kinds.get(key) ?? { count: 0, maxMs: 0, ms: 0 };
    kinds.set(key, { count: total.count + 1, maxMs: Math.max(total.maxMs, gpuMs), ms: total.ms + gpuMs });
  }

  return [
    `  gpu ${passes.length} passes timed, ${roundMs(computeMedian(frameGpuMs))} ms a frame at the median and ${roundMs(frameGpuMs.reduce((most, ms) => Math.max(most, ms), 0))} at most, begun ${roundMs(computeMedian(queuedMs))} ms after their submit at the median and ${roundMs(queuedMs.reduce((most, ms) => Math.max(most, ms), 0))} at most`,
    ...[...kinds]
      .toSorted(([, firstKind], [, secondKind]) => secondKind.ms - firstKind.ms)
      .slice(0, LISTED_PASSES_PER_STATE)
      .map(
        ([key, { count, maxMs, ms }]) => `  gpu ${count}x for ${roundMs(ms)} ms, at most ${roundMs(maxMs)} ms: ${key}`,
      ),
  ];
};
