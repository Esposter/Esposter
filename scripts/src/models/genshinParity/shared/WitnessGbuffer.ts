// The witness render's G-buffer at one view, row by row from the top, four floats a pixel in each target: the albedo
// Its exported materials draw unlit, the depth along the view in metres, the world normal, and the part drawn there
// (its identifier from one, zero where no part is) with its family's index in `families`. Each part's identifier names
// It in `parts`
export interface WitnessGbuffer {
  albedo: Float32Array;
  depth: Float32Array;
  families: string[];
  height: number;
  normal: Float32Array;
  part: Float32Array;
  parts: { family: string; id: number; mesh: string }[];
  width: number;
}
