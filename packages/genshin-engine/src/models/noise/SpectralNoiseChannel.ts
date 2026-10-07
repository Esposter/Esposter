// One channel of a texture as the statistics it is synthesized from: its mean and the root mean square amplitude of
// Its spectrum in each bin (`getSpectralBin`), over a texel, so a field of any phases drawn under it varies as the
// Texture did at every scale and in every direction; the values its synthesis is handed by rank, at evenly spaced
// Shares from least to most, one list a band of rows from the first row down, so its values spread as the texture's
// Did (none keeps the synthesis's own); and an earlier channel whose phases it shares in part, by the correlation
// Their values held
export interface SpectralNoiseChannel {
  amplitudes: number[];
  correlation?: { channel: number; share: number };
  mean: number;
  quantiles?: number[][];
}
