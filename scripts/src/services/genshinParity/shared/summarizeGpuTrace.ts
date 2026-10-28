import type { GpuTrace } from "#src/models/genshinParity/shared/GpuTrace";
import type { TracedState } from "#src/models/genshinParity/shared/TracedState";

import { SLOW_FRAME_MS } from "#src/services/genshinParity/shared/constants";
import { describeBuilds } from "#src/services/genshinParity/shared/describeBuilds";
import { describeCategories } from "#src/services/genshinParity/shared/describeCategories";
import { describeFrame } from "#src/services/genshinParity/shared/describeFrame";
import { describePasses } from "#src/services/genshinParity/shared/describePasses";
import { summarizeSceneKinds } from "#src/services/genshinParity/shared/summarizeSceneKinds";

// The GPU calls behind each stall: the cold orbit's slowest frame, then every frame past 50 ms in the other states. A frame's
// Gap runs from its start to the next frame's, and the calls it made are the ones its animation frame ran. Each state first
// Reads its own calls by cause, every call started between its first and its last frame, then, where the adapter has
// Timestamp queries, the GPU's own time on the passes encoded in those frames; then each kind of the scene's objects
// Priced on each pass, where the run hid them in turn
export const summarizeGpuTrace = (trace: GpuTrace, states: TracedState[]): string[] => {
  const timeFrameIndexMap = new Map(trace.times.map((time, index) => [time, index]));
  const lines: string[] = trace.passes ? [] : ["the adapter has no timestamp queries, so no pass is timed on the GPU"];
  const statePassesList = states.map(({ frames }) => {
    const firstTime = frames[0]?.time ?? 0;
    const lastTime = frames.at(-1)?.time ?? 0;
    return (trace.passes ?? []).filter((pass) => {
      const time = trace.times[pass.frame] ?? -1;
      return time >= firstTime && time <= lastTime;
    });
  });
  // Read over the states alone: the passes drawn while the page loads hold times on another clock's reading
  const offsetMs = statePassesList
    .flat()
    .reduce((least, { beginMs, submittedMs }) => Math.min(least, beginMs - submittedMs), Number.POSITIVE_INFINITY);
  for (const [stateIndex, { frames, name }] of states.entries()) {
    const firstTime = frames[0]?.time ?? 0;
    const lastTime = frames.at(-1)?.time ?? 0;
    const stateCalls = trace.calls.filter((call) => call.start >= firstTime && call.start <= lastTime);
    const statePasses = statePassesList[stateIndex] ?? [];
    lines.push(
      `${name}: ${stateCalls.length} traced calls started in its frames, ${describeCategories(stateCalls) || "none"}`,
      ...describeBuilds(stateCalls),
      ...(statePasses.length > 0 ? describePasses(statePasses, offsetMs) : []),
    );
    const gaps = frames
      .slice(0, -1)
      .map((frame, index) => ({ gapMs: (frames[index + 1]?.time ?? frame.time) - frame.time, time: frame.time }));
    const isCold = name.startsWith("cold orbit");
    const stalled = isCold
      ? gaps.toSorted((firstGap, secondGap) => secondGap.gapMs - firstGap.gapMs).slice(0, 1)
      : gaps.filter(({ gapMs }) => gapMs > SLOW_FRAME_MS);
    lines.push(`${name}: ${stalled.length} frame(s) traced`);
    for (const { gapMs, time } of stalled)
      lines.push(...describeFrame(time, gapMs, trace, timeFrameIndexMap, offsetMs));
  }
  if (trace.kinds && trace.passes) lines.push(...summarizeSceneKinds(trace.passes, trace.times, trace.kinds));

  return lines;
};
