import type { CloudLayerTextureProfiles } from "genshin-engine";

import { computeCorrelation } from "#src/services/genshinAssets/fit/computeCorrelation";
import { computeTextureMean } from "#src/services/genshinAssets/fit/computeTextureMean";
import { fitSlopeHeight } from "#src/services/genshinAssets/fit/fitSlopeHeight";
import { fitSpectralNoiseChannel } from "#src/services/genshinAssets/fit/fitSpectralNoiseChannel";
import { readChannels } from "#src/services/genshinAssets/fit/readChannels";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toProfile } from "#src/services/genshinAssets/fit/toProfile";
import { join } from "node:path";

// How many quantiles each channel's values keep, every thirty-second of them, so a threshold the layer cuts its
// Density at falls between two a few hundredths apart; and the bands of rows the wisps' strip keeps its own in, its
// Tufts thickening toward the horizon
const QUANTILE_COUNT = 33;
const WISPS_ROW_BAND_COUNT = 8;
// The wisps' strip read at half its size each way, a quarter of the texels to synthesize, its wisps soft streaks the
// Dome magnifies past either size
const WISPS_SCALE = 0.5;
// The correlation's decimals, and the least slope a frequency's central differences must reach for its height to be
// Read from its slope, past which the differences read nothing of it (the Nyquist row and column)
const CORRELATION_DECIMALS = 2;

// A sky's cloud layer's textures as the statistics ours are synthesized from (`CloudLayerTextureProfiles`), read off
// The game's own in the folder given and none of their texels kept: the density's four channels, the curl's two, the
// Second following the first by their correlation, the wisps' alpha by bands of rows, and the normal map as the height
// Its slopes are of and the mean direction it leans in
export const fitCloudLayerTextures = async (textureDirectory: string): Promise<CloudLayerTextureProfiles> => {
  const readTexture = (name: string, scale?: number) => readChannels(join(textureDirectory, `${name}.png`), scale);
  const [density, curl, normal, wisps] = await Promise.all([
    readTexture("Enviro_Clouds_Voronoi"),
    readTexture("Enviro_Clouds_Curl"),
    readTexture("Enviro_Clouds_Normal"),
    readTexture("Enviro_Clouds_Wispis", WISPS_SCALE),
  ]);
  const stationary = { count: QUANTILE_COUNT, rowBandCount: 1 };
  const [curlAcross = new Float64Array(), curlDown = new Float64Array()] = curl.channels;
  const [normalAcross = new Float64Array(), normalDown = new Float64Array(), normalOut = new Float64Array()] =
    normal.channels.slice(0, 3).map((values) => values.map((value) => value * 2 - 1));
  return {
    curl: toProfile(curl, [
      fitSpectralNoiseChannel(curlAcross, curl.width, curl.height, stationary),
      {
        ...fitSpectralNoiseChannel(curlDown, curl.width, curl.height, stationary),
        correlation: { channel: 0, share: roundFitted(computeCorrelation(curlAcross, curlDown), CORRELATION_DECIMALS) },
      },
    ]),
    density: toProfile(
      density,
      density.channels.map((values) => fitSpectralNoiseChannel(values, density.width, density.height, stationary)),
    ),
    normal: {
      bias: [normalAcross, normalDown, normalOut].map((values) => roundFitted(computeTextureMean(values))),
      height: toProfile(normal, [
        { amplitudes: fitSlopeHeight(normalAcross, normalDown, normal.width, normal.height), mean: 0 },
      ]),
    },
    wisps: toProfile(wisps, [
      fitSpectralNoiseChannel(wisps.channels[3] ?? new Float64Array(), wisps.width, wisps.height, {
        count: QUANTILE_COUNT,
        rowBandCount: WISPS_ROW_BAND_COUNT,
      }),
    ]),
  };
};
