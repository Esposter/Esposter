import type { GroundLayerCellTile } from "#src/models/genshinAssets/fit/GroundLayerCellTile";
import type { SurfaceSample } from "#src/models/genshinAssets/fit/SurfaceSample";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Vector } from "#src/models/shared/Vector";
import type { GroundLayer } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { computeSurfaceTones } from "#src/services/genshinAssets/fit/computeSurfaceTones";
import { TERRAIN_BASE_MAP_SUFFIX, TERRAIN_TILE_SIZE } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

// Each ground layer's colour as a component's terrain shows it: the mean of its base maps' texels within the terrain
// Radius of the world's origin that stand on a cell its tile paints in that layer (`readGroundLayerCells`), as hex,
// Read a cell at a time, each cell's mean weighing its texels. A texel's column runs along the game's x and its row from the
// Top down the game's z, as the terrain mesh's UVs lay it (`formatTerrainObj`); a tile with no base map, or a layer no
// Texel stands on, gives none
export const fitGroundLayerColours = async (
  component: DerivedAssetComponent,
  tiles: GroundLayerCellTile[],
  [originX, , originZ]: [number, number, number],
  terrainRadius: number,
): Promise<Partial<Record<GroundLayer, string>>> => {
  const textureDirectory = join(getComponentDirectory(component).assets, AssetType.Texture2D);
  const layerSamplesMap = new Map<GroundLayer, SurfaceSample[]>();
  for (const { cells, column, name, resolution, row } of tiles) {
    const baseMap = join(textureDirectory, `${name}${TERRAIN_BASE_MAP_SUFFIX}.png`);
    if (!existsSync(baseMap)) continue;
    // oxlint-disable-next-line no-await-in-loop -- one tile's base map is held at a time
    const { data, info } = await sharp(baseMap).raw().toBuffer({ resolveWithObject: true });
    const cellMetres = TERRAIN_TILE_SIZE / resolution;
    const sums = new Float64Array(cells.length * 3);
    const counts = new Float64Array(cells.length);
    for (let texelRow = 0; texelRow < info.height; texelRow++)
      for (let texelColumn = 0; texelColumn < info.width; texelColumn++) {
        const along = ((texelColumn + 0.5) / info.width) * TERRAIN_TILE_SIZE;
        const across = ((info.height - texelRow - 0.5) / info.height) * TERRAIN_TILE_SIZE;
        const x = column * TERRAIN_TILE_SIZE + along - originX;
        const z = originZ - (row * TERRAIN_TILE_SIZE + across);
        if (Math.hypot(x, z) > terrainRadius) continue;
        const cell = Math.floor(across / cellMetres) * resolution + Math.floor(along / cellMetres);
        const offset = (texelRow * info.width + texelColumn) * info.channels;
        for (let channel = 0; channel < 3; channel++)
          sums[cell * 3 + channel] = (sums[cell * 3 + channel] ?? 0) + (data[offset + channel] ?? 0);
        counts[cell] = (counts[cell] ?? 0) + 1;
      }
    for (const [cell, layer] of cells.entries()) {
      const count = counts[cell] ?? 0;
      if (count === 0) continue;
      const colour = [0, 1, 2].map((channel) => (sums[cell * 3 + channel] ?? 0) / count) as Vector;
      const layerSamples = layerSamplesMap.get(layer) ?? [];
      layerSamples.push({ colour, part: "", weight: count });
      layerSamplesMap.set(layer, layerSamples);
    }
  }
  return Object.fromEntries(
    Array.from(layerSamplesMap, ([layer, members]) => [layer, computeSurfaceTones(members, 1).color]),
  );
};
