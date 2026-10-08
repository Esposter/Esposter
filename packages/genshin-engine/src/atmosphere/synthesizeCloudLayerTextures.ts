import type { CloudLayerTextureProfiles } from "#src/models/atmosphere/CloudLayerTextureProfiles";
import type { DataTexture } from "three";

import { writeCloudLayerTexture } from "#src/atmosphere/writeCloudLayerTexture";
import { synthesizeSpectralNoise } from "#src/noise/synthesizeSpectralNoise";
import { createSeededRandom } from "#src/random/createSeededRandom";

// The seed every cloud layer's textures are drawn from, so each draws the same clouds
const CLOUD_LAYER_TEXTURE_SEED = 0x63_6c_6f_75;
// The longest a texture waits for an idle moment before it is drawn anyway, so a scene that never idles still gets
// Its clouds
const IDLE_TIMEOUT_MS = 1000;
const waitForIdle = (): Promise<void> =>
  new Promise((resolve) => {
    requestIdleCallback(
      () => {
        resolve();
      },
      { timeout: IDLE_TIMEOUT_MS },
    );
  });
// A sky's cloud layer's textures (`createCloudLayerTextures`) written in place from their statistics (`CloudLayerTextureProfiles`,
// `synthesizeSpectralNoise`), none taken from the game's: its density's four channels, its curl's two, its wisps' strip
// In the alpha over white, and its normal map, each texel the height's slope by central differences, wrapping, off the
// Direction it leans in, encoded from -1 to 1 into 0 to 1. Each is drawn in an idle moment of its own, a
// Few tenths of a second of work in all that would otherwise hold the scene's mount
export const synthesizeCloudLayerTextures = async (
  { curl, density, normal, wisps }: CloudLayerTextureProfiles,
  textures: Record<"curl" | "density" | "normal" | "wisps", DataTexture>,
): Promise<void> => {
  const random = createSeededRandom(CLOUD_LAYER_TEXTURE_SEED);
  await waitForIdle();
  const densityFields = synthesizeSpectralNoise(density, random);
  writeCloudLayerTexture(textures.density, (index) => densityFields.map((field) => field[index] ?? 0));
  await waitForIdle();
  const [curlAcross, curlDown] = synthesizeSpectralNoise(curl, random);
  writeCloudLayerTexture(textures.curl, (index) => [curlAcross?.[index] ?? 0, curlDown?.[index] ?? 0, 0, 1]);
  await waitForIdle();
  const [wispsField] = synthesizeSpectralNoise(wisps, random);
  writeCloudLayerTexture(textures.wisps, (index) => [1, 1, 1, wispsField?.[index] ?? 0]);
  await waitForIdle();
  const [height] = synthesizeSpectralNoise(normal.height, random);
  const [biasAcross = 0, biasDown = 0, biasOut = 1] = normal.bias;
  const { height: rows, width: columns } = normal.height;
  const readHeight = (column: number, row: number): number =>
    height?.[((row + rows) % rows) * columns + ((column + columns) % columns)] ?? 0;
  writeCloudLayerTexture(textures.normal, (index) => {
    const [column, row] = [index % columns, Math.floor(index / columns)];
    const across = biasAcross - (readHeight(column + 1, row) - readHeight(column - 1, row)) / 2;
    const down = biasDown - (readHeight(column, row + 1) - readHeight(column, row - 1)) / 2;
    return [...[across, down, biasOut].map((value) => value * 0.5 + 0.5), 1];
  });
};
