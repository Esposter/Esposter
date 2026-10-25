import type { CpuCapture } from "#src/models/genshinParity/shared/CpuCapture";

import { MICROSECONDS_PER_MS } from "#src/services/genshinParity/shared/constants";
import { describeFunction } from "#src/services/genshinParity/shared/describeFunction";

// How many of the window's main-thread samples name a function, at most, the rest being left to the frame's total
const LISTED_FUNCTIONS = 4;

// The functions the main thread ran in the window, by the samples that held each: a frame that waits on the GPU reads as the
// Native call it waited in, and one that builds shaders or geometry as the functions doing it
export const summarizeCpuWindow = (cpu: CpuCapture, startMs: number, endMs: number): string[] => {
  const nodeMap = new Map(cpu.nodes.map((node) => [node.id, node]));
  const nodeSamplesMap = new Map<number, number>();
  let clockUs = cpu.startTime;
  let sampleCount = 0;
  for (const [index, nodeId] of cpu.samples.entries()) {
    clockUs += cpu.timeDeltas[index] ?? 0;
    const timeMs = clockUs / MICROSECONDS_PER_MS - cpu.offsetMs;
    if (timeMs < startMs || timeMs > endMs) continue;
    sampleCount++;
    nodeSamplesMap.set(nodeId, (nodeSamplesMap.get(nodeId) ?? 0) + 1);
  }

  const listed = [...nodeSamplesMap]
    .toSorted(([, firstSamples], [, secondSamples]) => secondSamples - firstSamples)
    .slice(0, LISTED_FUNCTIONS)
    .map(([nodeId, samples]) => {
      const node = nodeMap.get(nodeId);
      return `  cpu ${samples} of ${sampleCount} samples in ${describeFunction(node ?? { callFrame: { functionName: "", lineNumber: 0, url: "" }, id: nodeId })}`;
    });

  return sampleCount > 0 ? listed : [];
};
