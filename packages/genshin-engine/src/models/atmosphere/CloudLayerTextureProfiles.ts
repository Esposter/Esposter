import type { SpectralNoiseProfile } from "#src/models/noise/SpectralNoiseProfile";

// The textures a sky's cloud layer samples, each as the statistics it is synthesized from (`SpectralNoiseProfile`): its
// Density's channels, its curl's two, its wisps' strip as one, and its normal map as the height it is the slope of and
// The mean direction it leans in, across, down and out of the surface
export interface CloudLayerTextureProfiles {
  curl: SpectralNoiseProfile;
  density: SpectralNoiseProfile;
  normal: { bias: number[]; height: SpectralNoiseProfile };
  wisps: SpectralNoiseProfile;
}
