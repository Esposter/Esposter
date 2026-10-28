import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";
import type { GpuTrace } from "#src/models/genshinParity/shared/GpuTrace";

import { describeCategories } from "#src/services/genshinParity/shared/describeCategories";
import { describeGpuFrames } from "#src/services/genshinParity/shared/describeGpuFrames";
import { roundMs } from "#src/services/genshinParity/shared/roundMs";
import { summarizeCpuWindow } from "#src/services/genshinParity/shared/summarizeCpuWindow";

// A call under this many milliseconds is counted in its frame's total but not listed, and at most this many are listed
const LISTED_CALL_MS = 0.5;
const LISTED_CALLS_PER_FRAME = 12;

const describeCall = (call: GpuCall): string =>
  `  ${roundMs(call.duration)} ms ${call.name} | ${call.label} | ${call.detail}`;

export const describeFrame = (
  time: number,
  gapMs: number,
  trace: GpuTrace,
  timeFrameIndexMap: Map<number, number>,
  offsetMs: number,
): string[] => {
  const frameIndex = timeFrameIndexMap.get(time) ?? -1;
  const calls = trace.calls.filter((call) => call.frame === frameIndex);
  const totalMs = calls.reduce((total, call) => total + call.duration, 0);
  const listed = calls
    .filter((call) => call.duration >= LISTED_CALL_MS)
    .toSorted((firstCall, secondCall) => secondCall.duration - firstCall.duration)
    .slice(0, LISTED_CALLS_PER_FRAME);

  return [
    `frame #${frameIndex} at ${roundMs(time - (trace.times[0] ?? 0))} ms: ${roundMs(gapMs)} ms, ${calls.length} traced calls for ${roundMs(totalMs)} ms`,
    `  ${describeCategories(calls) || "no traced calls"}`,
    ...listed.map((call) => describeCall(call)),
    ...(trace.cpu ? summarizeCpuWindow(trace.cpu, time, time + gapMs) : []),
    ...(trace.passes ? describeGpuFrames(trace.passes, frameIndex, offsetMs) : []),
  ];
};
