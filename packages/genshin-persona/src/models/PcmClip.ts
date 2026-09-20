// One channel of decoded audio, as every measurement here reads it
export interface PcmClip {
  sampleRate: number;
  samples: Float32Array;
}
