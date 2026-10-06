import type { TerrainHeights } from "#src/models/genshinAssets/world/TerrainHeights";

const WORD = 4;
const SAMPLE_BYTES = 2;
// Unity keeps a terrain's heights as 16-bit samples of its height scale, the highest sample this
const MAX_SAMPLE = 32_766;
// The fewest samples a side a tile's heightfield takes, and every side is a power of two and one
const MIN_RESOLUTION = 33;
// Past the heights, their precomputed error and their patches' bounds, each a count and that many floats, then the
// Heightfield's width and height in samples, its thickness and level count, and its scale: metres between samples
// Along x, the height a full sample stands for, and metres between samples along z
const SPACING_OFFSET = 4 * WORD;
const HEIGHT_SCALE_OFFSET = 5 * WORD;

const checkIsResolution = (resolution: number): boolean =>
  Number.isInteger(resolution) && resolution >= MIN_RESOLUTION && ((resolution - 1) & (resolution - 2)) === 0;
// A terrain tile's heightfield out of its TerrainData's raw export (`BigWorldTerrain_1_-2.bin`). What precedes it, the
// Splat and detail databases, varies in length, so the heights are found by their shape: a count that is a square of
// A side a power of two and one, whose array is followed by the two arrays above and then that side twice
export const parseTerrainHeights = (bytes: Buffer): TerrainHeights | undefined => {
  for (let offset = 0; offset + WORD <= bytes.length; offset += WORD) {
    const count = bytes.readUInt32LE(offset);
    const resolution = Math.sqrt(count);
    if (!checkIsResolution(resolution)) continue;
    const heightsOffset = offset + WORD;
    const errorOffset = Math.ceil((heightsOffset + count * SAMPLE_BYTES) / WORD) * WORD;
    if (errorOffset + WORD > bytes.length) continue;
    const boundsOffset = errorOffset + WORD + bytes.readUInt32LE(errorOffset) * WORD;
    if (boundsOffset + WORD > bytes.length) continue;
    const tailOffset = boundsOffset + WORD + bytes.readUInt32LE(boundsOffset) * WORD;
    if (tailOffset + HEIGHT_SCALE_OFFSET + WORD > bytes.length) continue;
    if (bytes.readUInt32LE(tailOffset) !== resolution || bytes.readUInt32LE(tailOffset + WORD) !== resolution) continue;
    const heightScale = bytes.readFloatLE(tailOffset + HEIGHT_SCALE_OFFSET);
    // Stored a column of z at a time along x, read into rows along z
    const heights = Float32Array.from({ length: count }, (_value, index) => {
      const sampleIndex = (index % resolution) * resolution + Math.floor(index / resolution);
      return (bytes.readInt16LE(heightsOffset + sampleIndex * SAMPLE_BYTES) / MAX_SAMPLE) * heightScale;
    });
    return { heights, resolution, spacing: bytes.readFloatLE(tailOffset + SPACING_OFFSET) };
  }
  return undefined;
};
