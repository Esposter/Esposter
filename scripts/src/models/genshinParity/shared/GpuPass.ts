// One render or compute pass the GPU ran, timed by the adapter's timestamp queries: when it began on the GPU's own clock
// And how long it ran there, in milliseconds, its encoder's label and its first attachment, the animation frame it was
// Encoded in, and the page's time when it was submitted. The GPU's clock runs at the page's rate from another start, so
// A pass began its begin less its submit, less the least of that over the run, after the GPU could first have begun it
export interface GpuPass {
  beginMs: number;
  detail: string;
  frame: number;
  gpuMs: number;
  label: string;
  submittedMs: number;
}
