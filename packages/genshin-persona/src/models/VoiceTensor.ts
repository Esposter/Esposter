// The two fields read off a tensor the engine returns: a waveform's samples in whatever width the vocoder's dtype
// Wrote them, and its shape
export interface VoiceTensor {
  data: ArrayLike<number>;
  dims: number[];
}
