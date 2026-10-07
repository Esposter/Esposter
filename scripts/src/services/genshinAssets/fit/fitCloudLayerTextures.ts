import type { CloudLayerTextureProfiles, SpectralNoiseProfile } from "genshin-engine";

import { fitSpectralNoiseChannel } from "#src/services/genshinAssets/fit/fitSpectralNoiseChannel";
import { fitSpectrumAmplitudes } from "#src/services/genshinAssets/fit/fitSpectrumAmplitudes";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { BYTE } from "#src/services/shared/constants";
import { transformFourierGrid } from "genshin-engine";
import { join } from "node:path";
import sharp from "sharp";

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
const LEAST_SLOPE = 1e-6;
const readChannels = async (
  path: string,
  scale = 1,
): Promise<{ channels: Float64Array[]; height: number; width: number }> => {
  const { width } = await sharp(path).metadata();
  const image = sharp(path);
  const { data, info } = await (scale === 1 ? image : image.resize({ kernel: "cubic", width: width * scale }))
    .raw()
    .toBuffer({ resolveWithObject: true });
  const count = info.width * info.height;
  return {
    channels: Array.from({ length: info.channels }, (_channel, channel) =>
      Float64Array.from({ length: count }, (_value, index) => (data[index * info.channels + channel] ?? 0) / BYTE),
    ),
    height: info.height,
    width: info.width,
  };
};
const toProfile = (
  { height, width }: { height: number; width: number },
  channels: SpectralNoiseProfile["channels"],
): SpectralNoiseProfile => ({ channels, height, width });
const computeMean = (values: Float64Array): number => values.reduce((sum, value) => sum + value, 0) / values.length;
const computeCorrelation = (first: Float64Array, second: Float64Array): number => {
  const [firstMean, secondMean] = [computeMean(first), computeMean(second)];
  let [product, firstSquare, secondSquare] = [0, 0, 0];
  for (const [index, value] of first.entries()) {
    const [firstOffset, secondOffset] = [value - firstMean, (second[index] ?? 0) - secondMean];
    product += firstOffset * secondOffset;
    firstSquare += firstOffset ** 2;
    secondSquare += secondOffset ** 2;
  }
  return product / Math.sqrt(firstSquare * secondSquare);
};
// The height a normal map is the slope of, as its spectrum: each frequency's power across both slopes over what the
// Central differences a synthesis takes them by pass at that frequency
const fitSlopeHeight = (across: Float64Array, down: Float64Array, width: number, height: number): number[] => {
  const transform = (values: Float64Array): { imaginary: Float64Array; real: Float64Array } => {
    const mean = computeMean(values);
    const real = values.map((value) => value - mean);
    const imaginary = new Float64Array(values.length);
    transformFourierGrid(real, imaginary, width, height);
    return { imaginary, real };
  };
  const [acrossSpectrum, downSpectrum] = [transform(across), transform(down)];
  const power = new Float64Array(width * height);
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++) {
      const index = row * width + column;
      const passed = Math.sin((2 * Math.PI * column) / width) ** 2 + Math.sin((2 * Math.PI * row) / height) ** 2;
      if (passed < LEAST_SLOPE) continue;
      power[index] =
        ((acrossSpectrum.real[index] ?? 0) ** 2 +
          (acrossSpectrum.imaginary[index] ?? 0) ** 2 +
          (downSpectrum.real[index] ?? 0) ** 2 +
          (downSpectrum.imaginary[index] ?? 0) ** 2) /
        passed;
    }
  return fitSpectrumAmplitudes(power, width, height);
};
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
      bias: [normalAcross, normalDown, normalOut].map((values) => roundFitted(computeMean(values))),
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
