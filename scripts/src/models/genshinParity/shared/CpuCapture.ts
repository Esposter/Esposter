// The page's main-thread samples over a run, as the DevTools protocol returns them: each sample's node and the time since the
// Sample before it, from a clock `offsetMs` apart from the page's own, so a sample's time is its clock less that offset
export interface CpuCapture {
  nodes: { callFrame: { functionName: string; lineNumber: number; url: string }; id: number }[];
  offsetMs: number;
  samples: number[];
  startTime: number;
  timeDeltas: number[];
}
