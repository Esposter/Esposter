import type { CloudLayerTextureProfiles } from "#src/models/atmosphere/CloudLayerTextureProfiles";
import type { SpectralNoiseProfile } from "#src/models/noise/SpectralNoiseProfile";

import { MAX_BYTE } from "#src/constants";
import { synthesizeSpectralNoise } from "#src/noise/synthesizeSpectralNoise";
import { createSeededRandom } from "#src/random/createSeededRandom";
import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat } from "three";

// The seed every cloud layer's textures are drawn from, so each draws the same clouds
const CLOUD_LAYER_TEXTURE_SEED = 0x63_6c_6f_75;
const toByte = (share: number): number => Math.round(Math.min(Math.max(share, 0), 1) * MAX_BYTE);
// A texture of four channels a texel, its fields' rows from the first down written from its last up, since a data
// Texture's first row is the bottom one an image loader turns its first into, and tiled at every edge
const createTexture = (
  { height, width }: Pick<SpectralNoiseProfile, "height" | "width">,
  readTexel: (index: number) => readonly number[],
): DataTexture => {
  const data = new Uint8Array(width * height * 4);
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++)
      data.set(
        readTexel(row * width + column).map((share) => toByte(share)),
        ((height - 1 - row) * width + column) * 4,
      );
  const texture = new DataTexture(data, width, height, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
};
// A sky's cloud layer's textures synthesized from their statistics (`CloudLayerTextureProfiles`,
// `synthesizeSpectralNoise`), none taken from the game's: its density's four channels, its curl's two, its wisps' strip
// In the alpha over white, and its normal map, each texel the height's slope by central differences, wrapping, off the
// Direction it leans in, encoded from -1 to 1 into 0 to 1
export const createCloudLayerTextures = ({
  curl,
  density,
  normal,
  wisps,
}: CloudLayerTextureProfiles): { curl: DataTexture; density: DataTexture; normal: DataTexture; wisps: DataTexture } => {
  const random = createSeededRandom(CLOUD_LAYER_TEXTURE_SEED);
  const densityFields = synthesizeSpectralNoise(density, random);
  const [curlAcross, curlDown] = synthesizeSpectralNoise(curl, random);
  const [wispsField] = synthesizeSpectralNoise(wisps, random);
  const [height] = synthesizeSpectralNoise(normal.height, random);
  const [biasAcross = 0, biasDown = 0, biasOut = 1] = normal.bias;
  const { height: rows, width: columns } = normal.height;
  const readHeight = (column: number, row: number): number =>
    height?.[((row + rows) % rows) * columns + ((column + columns) % columns)] ?? 0;
  return {
    curl: createTexture(curl, (index) => [curlAcross?.[index] ?? 0, curlDown?.[index] ?? 0, 0, 1]),
    density: createTexture(density, (index) => densityFields.map((field) => field[index] ?? 0)),
    normal: createTexture(normal.height, (index) => {
      const [column, row] = [index % columns, Math.floor(index / columns)];
      const across = biasAcross - (readHeight(column + 1, row) - readHeight(column - 1, row)) / 2;
      const down = biasDown - (readHeight(column, row + 1) - readHeight(column, row - 1)) / 2;
      return [...[across, down, biasOut].map((value) => value * 0.5 + 0.5), 1];
    }),
    wisps: createTexture(wisps, (index) => [1, 1, 1, wispsField?.[index] ?? 0]),
  };
};
