// The one field read off a tensor the engine returns or is handed: its values, a waveform's samples or the speech
// Tokens, which the runtime holds in a 64-bit integer array for the tokens and a float array for the samples
export interface VoiceTensor {
  data: ArrayLike<bigint | number>;
}
