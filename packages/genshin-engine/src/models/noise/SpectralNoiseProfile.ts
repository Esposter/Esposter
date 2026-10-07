import type { SpectralNoiseChannel } from "#src/models/noise/SpectralNoiseChannel";

// A texture as the statistics it is synthesized from, its channels' (`SpectralNoiseChannel`) at its size, each side a
// Power of two
export interface SpectralNoiseProfile {
  channels: SpectralNoiseChannel[];
  height: number;
  width: number;
}
