import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";
import type { GpuTrace } from "#src/models/genshinParity/shared/GpuTrace";
import type { TracedState } from "#src/models/genshinParity/shared/TracedState";

import { summarizeCpuWindow } from "#src/services/genshinParity/shared/summarizeCpuWindow";

// A frame is slow past this many milliseconds, the same line the stall summary counts by
const SLOW_FRAME_MS = 50;
// A call under this many milliseconds is counted in its frame's total but not listed, and at most this many are listed
const LISTED_CALL_MS = 0.5;
const LISTED_CALLS_PER_FRAME = 12;
const LISTED_BUILDS_PER_STATE = 12;
const MS_DECIMALS = 10;

const roundMs = (ms: number): number => Math.round(ms * MS_DECIMALS) / MS_DECIMALS;

// The cause a call is counted under: a pipeline compiled, a shader module compiled, a texture or a buffer made or uploaded,
// Or, on the main thread, a node material built or a program added
const getCategory = (name: string): string => {
  if (name === "buildNodes") return "node builds";
  if (name === "createProgram") return "programs";
  if (name.includes("Pipeline")) return "pipelines";
  if (name === "createShaderModule") return "shaders";
  if (name === "createBuffer" || name === "writeBuffer") return "buffers";
  if (name === "submit" || name === "getCurrentTexture") return "submits";
  return "textures";
};

// Each cause's count and time in a frame, so a frame reads as its causes before its single calls
const describeCategories = (calls: GpuCall[]): string => {
  const categories = new Map<string, { count: number; ms: number }>();
  for (const call of calls) {
    const category = getCategory(call.name);
    const total = categories.get(category) ?? { count: 0, ms: 0 };
    categories.set(category, { count: total.count + 1, ms: total.ms + call.duration });
  }

  return Array.from(categories, ([category, { count, ms }]) => `${category} ${count} (${roundMs(ms)} ms)`).join(", ");
};

// The node materials a state built, one line a material and object, most time first, so a build the state should not
// Have made is named by what it was built for
const describeBuilds = (calls: GpuCall[]): string[] => {
  const builds = new Map<string, { count: number; ms: number }>();
  for (const call of calls) {
    if (call.name !== "buildNodes") continue;
    const key = `${call.label} | ${call.detail}`;
    const total = builds.get(key) ?? { count: 0, ms: 0 };
    builds.set(key, { count: total.count + 1, ms: total.ms + call.duration });
  }

  return [...builds]
    .toSorted(([, firstBuild], [, secondBuild]) => secondBuild.ms - firstBuild.ms)
    .slice(0, LISTED_BUILDS_PER_STATE)
    .map(([key, { count, ms }]) => `  built ${count}x for ${roundMs(ms)} ms: ${key}`);
};

const describeFrame = (time: number, gapMs: number, trace: GpuTrace, frameIndexOf: Map<number, number>): string[] => {
  const frameIndex = frameIndexOf.get(time) ?? -1;
  const calls = trace.calls.filter((call) => call.frame === frameIndex);
  const totalMs = calls.reduce((total, call) => total + call.duration, 0);
  const listed = calls
    .filter((call) => call.duration >= LISTED_CALL_MS)
    .toSorted((firstCall, secondCall) => secondCall.duration - firstCall.duration)
    .slice(0, LISTED_CALLS_PER_FRAME);
  const describeCall = (call: GpuCall): string =>
    `  ${roundMs(call.duration)} ms ${call.name} | ${call.label} | ${call.detail}`;

  return [
    `frame #${frameIndex} at ${roundMs(time - (trace.times[0] ?? 0))} ms: ${roundMs(gapMs)} ms, ${calls.length} traced calls for ${roundMs(totalMs)} ms`,
    `  ${describeCategories(calls) || "no traced calls"}`,
    ...listed.map((call) => describeCall(call)),
    ...(trace.cpu ? summarizeCpuWindow(trace.cpu, time, time + gapMs) : []),
  ];
};

// The GPU calls behind each stall: the cold orbit's slowest frame, then every frame past 50 ms in the other states. A frame's
// Gap runs from its start to the next frame's, and the calls it made are the ones its animation frame ran. Each state first
// Reads its own calls by cause, every call started between its first and its last frame
export const summarizeGpuTrace = (trace: GpuTrace, states: TracedState[]): string[] => {
  const frameIndexOf = new Map(trace.times.map((time, index) => [time, index]));
  const lines: string[] = [];
  for (const { frames, name } of states) {
    const firstTime = frames[0]?.time ?? 0;
    const lastTime = frames.at(-1)?.time ?? 0;
    const stateCalls = trace.calls.filter((call) => call.start >= firstTime && call.start <= lastTime);
    lines.push(
      `${name}: ${stateCalls.length} traced calls started in its frames, ${describeCategories(stateCalls) || "none"}`,
      ...describeBuilds(stateCalls),
    );
    const gaps = frames
      .slice(0, -1)
      .map((frame, index) => ({ gapMs: (frames[index + 1]?.time ?? frame.time) - frame.time, time: frame.time }));
    const isCold = name.startsWith("cold orbit");
    const stalled = isCold
      ? gaps.toSorted((firstGap, secondGap) => secondGap.gapMs - firstGap.gapMs).slice(0, 1)
      : gaps.filter(({ gapMs }) => gapMs > SLOW_FRAME_MS);
    lines.push(`${name}: ${stalled.length} frame(s) traced`);
    for (const { gapMs, time } of stalled) lines.push(...describeFrame(time, gapMs, trace, frameIndexOf));
  }

  return lines;
};
