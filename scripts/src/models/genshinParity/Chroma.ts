// A signal's pitch classes frame by frame, twelve to a frame, and each frame's loudness
export interface Chroma {
  classes: Float32Array;
  loudness: Float32Array;
}
