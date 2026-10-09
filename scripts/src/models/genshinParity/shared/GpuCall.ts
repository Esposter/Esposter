// One WebGPU call the parity page made: its name, when it began and how long it held the frame, the animation frame it ran in,
// And a label and detail read off its descriptor. A call that returns a promise also keeps when that promise settled
export interface GpuCall {
  detail: string;
  duration: number;
  frame: number;
  label: string;
  name: string;
  settled?: number;
  start: number;
}
