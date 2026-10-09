// A surface's pixels, their mask and the octave bands' blur sigmas, as the host computes them
export interface SurfaceStatisticsInput {
  height: number;
  mask: Uint8Array;
  sigmas: number[];
  values: Float32Array;
  width: number;
}
