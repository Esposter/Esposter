import type { CpuCapture } from "#src/models/genshinParity/shared/CpuCapture";

// How many of the window's main-thread samples name a function, at most, the rest being left to the frame's total
const LISTED_FUNCTIONS = 4;
const MICROSECONDS_PER_MS = 1000;

const describeFunction = (node: CpuCapture["nodes"][number]): string => {
  const { functionName, lineNumber, url } = node.callFrame;
  const place = url ? `${url.split("/").slice(-2).join("/")}:${lineNumber}` : "native";

  return `${functionName || "(anonymous)"} ${place}`;
};

// The functions the main thread ran in the window, by the samples that held each: a frame that waits on the GPU reads as the
// Native call it waited in, and one that builds shaders or geometry as the functions doing it
export const summarizeCpuWindow = (cpu: CpuCapture, startMs: number, endMs: number): string[] => {
  const nodeById = new Map(cpu.nodes.map((node) => [node.id, node]));
  const samplesByNode = new Map<number, number>();
  let clockUs = cpu.startTime;
  let sampleCount = 0;
  for (const [index, nodeId] of cpu.samples.entries()) {
    clockUs += cpu.timeDeltas[index] ?? 0;
    const timeMs = clockUs / MICROSECONDS_PER_MS - cpu.offsetMs;
    if (timeMs < startMs || timeMs > endMs) continue;
    sampleCount++;
    samplesByNode.set(nodeId, (samplesByNode.get(nodeId) ?? 0) + 1);
  }

  const listed = [...samplesByNode]
    .toSorted((first, second) => second[1] - first[1])
    .slice(0, LISTED_FUNCTIONS)
    .map(([nodeId, samples]) => {
      const node = nodeById.get(nodeId);
      return `  cpu ${samples} of ${sampleCount} samples in ${describeFunction(node ?? { callFrame: { functionName: "", lineNumber: 0, url: "" }, id: nodeId })}`;
    });

  return sampleCount > 0 ? listed : [];
};
