// A signal's magnitude spectrum frame by frame, row after row: each frame `binCount` bins of `sampleRate / frameLength`
// Hertz, its window starting `hopLength` samples after the last's
export interface Spectrogram {
  binCount: number;
  frameCount: number;
  frameLength: number;
  hopLength: number;
  magnitudes: Float32Array;
  sampleRate: number;
}
