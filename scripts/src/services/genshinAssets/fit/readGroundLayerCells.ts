import type { GroundLayerCellTile } from "#src/models/genshinAssets/fit/GroundLayerCellTile";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { TerrainSplatLayer } from "#src/models/genshinAssets/world/TerrainSplatLayer";

import { checkIsTerrainSplatKind } from "#src/services/genshinAssets/fit/checkIsTerrainSplatKind";
import { TerrainSplatKindGroundLayerMap } from "#src/services/genshinAssets/fit/TerrainSplatKindGroundLayerMap";
import { TERRAIN_PATH_DIFFUSE } from "#src/services/genshinAssets/shared/constants";
import { readAssetNames } from "#src/services/genshinAssets/shared/readAssetNames";
import { readTerrainSplats } from "#src/services/genshinAssets/world/readTerrainSplats";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GroundLayer } from "genshin-engine";

// Each terrain tile of a part of the open world, by its column, name and row, with the ground layer every one of its
// Cells is painted in, the cells a side, row by row along the game's z with its x within a row, as its heights run. A
// Cell's layer is its splat layer's kind's, but for the stone the game paints its roads in, which is the path: its cells
// Run as thin lines along the roads its base maps show. A kind no tile was read holding is an error rather than a guess
export const readGroundLayerCells = async (component: DerivedAssetComponent): Promise<GroundLayerCellTile[]> => {
  const tiles = await readTerrainSplats(component);
  const diffusePathIdNameMap = await readAssetNames(
    new Set(tiles.flatMap(({ splat }) => splat.layers.map(({ diffusePathId }) => diffusePathId))),
  );
  const toGroundLayer = ({ diffusePathId, kind }: TerrainSplatLayer, tile: string): GroundLayer => {
    if (diffusePathIdNameMap.get(diffusePathId) === TERRAIN_PATH_DIFFUSE) return GroundLayer.Path;
    if (!checkIsTerrainSplatKind(kind))
      throw new InvalidOperationError(Operation.Read, tile, `paints a layer of kind ${kind}, which no ground layer is`);
    return TerrainSplatKindGroundLayerMap[kind];
  };
  return tiles.map(({ column, name, row, splat }) => {
    const layers = splat.layers.map((layer) => toGroundLayer(layer, name));
    const cells = Array.from(splat.cells, (cell) => {
      const layer = layers[cell];
      if (layer === undefined)
        throw new InvalidOperationError(Operation.Read, name, `paints a cell in no layer ${cell}`);
      return layer;
    });
    return { cells, column, name, resolution: splat.resolution, row };
  });
};
