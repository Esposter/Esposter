// The two frames of one reference at the display width, with the masks read over them. Each pixel's family is the index
// Into `families` its part is drawn as, -1 where no part stands. The shadow is the share of the sun our render lets reach
// It, and the scored mask is 1 where the reference's scored region holds the pixel
export interface RadianceFrames {
  families: readonly string[];
  family: Float32Array;
  height: number;
  ours: Buffer;
  reference: Buffer;
  scored: Uint8Array;
  shadow: Float32Array;
  width: number;
}
