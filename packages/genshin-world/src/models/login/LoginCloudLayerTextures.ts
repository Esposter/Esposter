import type { CloudLayerTextureProfiles, SpectralNoiseChannel, SpectralNoiseProfile } from "genshin-engine";

import { SPECTRAL_ANGULAR_BIN_COUNT, SPECTRAL_RADIAL_BIN_COUNT } from "genshin-engine";
import { z } from "zod";

// A channel's amplitudes hold one value a spectral bin, and its quantiles a row of values for each band of the texture
const spectralNoiseChannelSchema = z.object({
  amplitudes: z.array(z.number()).length(SPECTRAL_RADIAL_BIN_COUNT * SPECTRAL_ANGULAR_BIN_COUNT),
  correlation: z.object({ channel: z.int().nonnegative(), share: z.number() }).optional(),
  mean: z.number(),
  quantiles: z.array(z.array(z.number())).optional(),
}) satisfies z.ZodType<SpectralNoiseChannel>;
const spectralNoiseProfileSchema = z.object({
  channels: z.array(spectralNoiseChannelSchema),
  height: z.int().positive(),
  width: z.int().positive(),
}) satisfies z.ZodType<SpectralNoiseProfile>;

// The statistics of the login sky's four cloud textures, the profiles `synthesizeCloudLayerTextures` is handed
export const loginCloudLayerTexturesSchema = z.object({
  curl: spectralNoiseProfileSchema,
  density: spectralNoiseProfileSchema,
  normal: z.object({ bias: z.array(z.number()).length(3), height: spectralNoiseProfileSchema }),
  wisps: spectralNoiseProfileSchema,
}) satisfies z.ZodType<CloudLayerTextureProfiles>;
