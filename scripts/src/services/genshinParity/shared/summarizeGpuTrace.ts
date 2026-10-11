import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";
import type { GpuPass } from "#src/models/genshinParity/shared/GpuPass";
import type { GpuTrace } from "#src/models/genshinParity/shared/GpuTrace";
import type { TracedState } from "#src/models/genshinParity/shared/TracedState";

import { computeMedian } from "#src/services/genshinAssets/shared/computeMedian";
import { summarizeCpuWindow } from "#src/services/genshinParity/shared/summarizeCpuWindow";

// A frame is slow past this many milliseconds, the same line the stall summary counts by
const SLOW_FRAME_MS = 50;
// A call under this many milliseconds is counted in its frame's total but not listed, and at most this many are listed
const LISTED_CALL_MS = 0.5;
const LISTED_CALLS_PER_FRAME = 12;
const LISTED_BUILDS_PER_STATE = 12;
// The passes a state lists by their GPU time, and the frames before a stall whose passes it reads, since a stall waits
// On work the GPU took in earlier
const LISTED_PASSES_PER_STATE = 6;
const GPU_FRAMES_BEFORE_STALL = 3;
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

// How long after its submit the GPU began a pass, against the run's quickest: the GPU's clock starts elsewhere than the
// Page's, so the least gap between the two is the one taken as no wait
const getQueuedMs = ({ beginMs, submittedMs }: GpuPass, offsetMs: number): number => beginMs - submittedMs - offsetMs;

// A state's passes by the GPU's own clock: their time a frame and how long the GPU left each queued after its submit, at
// The median and at most, then the passes that took the most of it, each kind of pass by its encoder and attachment
const describePasses = (passes: GpuPass[], offsetMs: number): string[] => {
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

// The GPU's time on a stalled frame's passes and on the frames before it, each with how long the GPU left them queued
// After their submit and its heaviest pass, so a stall waiting on a backlog is named by the work that built it
const describeGpuFrames = (passes: GpuPass[], frameIndex: number, offsetMs: number): string[] =>
  Array.from({ length: GPU_FRAMES_BEFORE_STALL + 1 }, (_value, offset) => frameIndex - GPU_FRAMES_BEFORE_STALL + offset)
    .map((frame) => passes.filter((pass) => pass.frame === frame))
    .filter((framePasses) => framePasses.length > 0)
    .map((framePasses) => {
      const heaviest = framePasses.toSorted((firstPass, secondPass) => secondPass.gpuMs - firstPass.gpuMs)[0];
      const gpuMs = framePasses.reduce((total, pass) => total + pass.gpuMs, 0);
      const queuedMs = framePasses.reduce((most, pass) => Math.max(most, getQueuedMs(pass, offsetMs)), 0);
      return `  gpu frame #${heaviest?.frame}: ${roundMs(gpuMs)} ms in ${framePasses.length} passes, begun up to ${roundMs(queuedMs)} ms after submit, heaviest ${roundMs(heaviest?.gpuMs ?? 0)} ms ${heaviest?.label} | ${heaviest?.detail}`;
    });

const describeFrame = (
  time: number,
  gapMs: number,
  trace: GpuTrace,
  frameIndexOf: Map<number, number>,
  offsetMs: number,
): string[] => {
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
    ...(trace.passes ? describeGpuFrames(trace.passes, frameIndex, offsetMs) : []),
  ];
};

// The GPU calls behind each stall: the cold orbit's slowest frame, then every frame past 50 ms in the other states. A frame's
// Gap runs from its start to the next frame's, and the calls it made are the ones its animation frame ran. Each state first
// Reads its own calls by cause, every call started between its first and its last frame, then, where the adapter has
// Timestamp queries, the GPU's own time on the passes encoded in those frames
export const summarizeGpuTrace = (trace: GpuTrace, states: TracedState[]): string[] => {
  const frameIndexOf = new Map(trace.times.map((time, index) => [time, index]));
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
    for (const { gapMs, time } of stalled) lines.push(...describeFrame(time, gapMs, trace, frameIndexOf, offsetMs));
  }

  return lines;
};
