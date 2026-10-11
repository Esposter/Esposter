import type { GroundLayerField } from "#src/models/genshinAssets/fit/GroundLayerField";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { computeGroundLayerField } from "#src/services/genshinAssets/fit/computeGroundLayerField";
import { readGroundLayerCells } from "#src/services/genshinAssets/fit/readGroundLayerCells";
import { TERRAIN_TILE_SIZE } from "#src/services/genshinAssets/shared/constants";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";

// A component's ground layers as a field over the terrain radius round the world's origin, in the world's axes:
// Three's, x as the game's and z its mirror. Every cell of its terrain tiles within the radius stands at its centre in the layer
// Its tile paints it in (`readGroundLayerCells`), each the same share of the ground, and is splatted onto a grid of the
// Cell size over the radius's square (`computeGroundLayerField`)
export const fitGroundLayerField = async (
  component: DerivedAssetComponent,
  terrainRadius: number,
  cellSize: number,
): Promise<GroundLayerField> => {
  const [tiles, [originX, , originZ]] = await Promise.all([
    readGroundLayerCells(component),
    readWorldOrigin(component),
  ]);
  const points = tiles.flatMap(({ cells, column, resolution, row }) => {
    const cellMetres = TERRAIN_TILE_SIZE / resolution;
    return cells.flatMap((layer, index) => {
      const x = column * TERRAIN_TILE_SIZE + ((index % resolution) + 0.5) * cellMetres - originX;
      const z = originZ - (row * TERRAIN_TILE_SIZE + (Math.floor(index / resolution) + 0.5) * cellMetres);
      return Math.hypot(x, z) > terrainRadius ? [] : [{ layer, x, z }];
    });
  });
  const nodeCount = Math.ceil((2 * terrainRadius) / cellSize) + 1;
  return computeGroundLayerField(points, {
    cellSize,
    origin: [-terrainRadius, -terrainRadius],
    size: [nodeCount, nodeCount],
  });
};
