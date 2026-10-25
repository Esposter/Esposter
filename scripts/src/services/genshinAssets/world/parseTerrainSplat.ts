import type { TerrainSplat } from "#src/models/genshinAssets/world/TerrainSplat";
import type { TerrainSplatLayer } from "#src/models/genshinAssets/world/TerrainSplatLayer";

import { checkIsCellResolution } from "#src/services/genshinAssets/world/checkIsCellResolution";

const WORD = 4;
// A pointer is a file index of one word and a path id of two
const POINTER_BYTES = 3 * WORD;
// A layer is its diffuse, normal and mask pointers, its tiling size and offset, eleven floats, and its kind twice
const LAYER_BYTES = 3 * POINTER_BYTES + 4 * WORD + 11 * WORD + 2 * WORD;
const TILE_SIZE_OFFSET = 3 * POINTER_BYTES;
const KIND_OFFSET = LAYER_BYTES - 2 * WORD;

// A terrain tile's splat database out of its TerrainData's raw export (`BigWorldTerrain_1_-1.bin`): past the tile's
// Name, its layers, each a fixed record; then its control maps' pointers and the resolutions and pointers that follow,
// Which vary in count, so the cell map is found by its shape past them: a count that is a square of a side a power of
// Two, whose bytes all name a layer. A tile listing no layers holds no cell map worth reading, so it gives none
export const parseTerrainSplat = (bytes: Buffer): TerrainSplat | undefined => {
  const layersOffset = Math.ceil((WORD + bytes.readUInt32LE(0)) / WORD) * WORD;
  const layerCount = bytes.readUInt32LE(layersOffset);
  if (layerCount === 0) return undefined;
  const layers = Array.from({ length: layerCount }, (_value, index): TerrainSplatLayer => {
    const offset = layersOffset + WORD + index * LAYER_BYTES;
    return {
      diffusePathId: bytes.readBigInt64LE(offset + WORD).toString(),
      kind: bytes.readInt32LE(offset + KIND_OFFSET),
      tileSize: bytes.readFloatLE(offset + TILE_SIZE_OFFSET),
    };
  });
  for (let offset = layersOffset + WORD + layerCount * LAYER_BYTES; offset + WORD <= bytes.length; offset += WORD) {
    const count = bytes.readUInt32LE(offset);
    const resolution = Math.sqrt(count);
    if (!checkIsCellResolution(resolution) || offset + WORD + count > bytes.length) continue;
    const cells = Uint8Array.from(bytes.subarray(offset + WORD, offset + WORD + count));
    if (cells.every((cell) => cell < layerCount)) return { cells, layers, resolution };
  }
  return undefined;
};
