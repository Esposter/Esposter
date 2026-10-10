import type { GroundLayerField } from "#src/models/genshinAssets/fit/GroundLayerField";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { computeGroundLayerField } from "#src/services/genshinAssets/fit/computeGroundLayerField";
import { createGroundToneClassifier } from "#src/services/genshinAssets/fit/createGroundToneClassifier";
import { TERRAIN_BASE_MAP_SUFFIX, TERRAIN_TILE_SIZE } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseTerrainTileName } from "#src/services/genshinAssets/world/parseTerrainTileName";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import sharp from "sharp";

// A component's ground layers as a field over the terrain radius round the world's origin, in the world's axes: Three's,
// X as the game's and z its mirror. Every texel of its terrain tiles' base maps within the radius is classed to its
// Nearest tone (`createGroundToneClassifier`), each the same share of the ground, and splatted onto a grid of the cell
// Size over the radius's square (`computeGroundLayerField`). A texel stands over its tile as the terrain mesh's UVs lay
// It: its column along the game's x, and its row from the top down the game's z (`formatTerrainObj`, `toTexel`)
export const fitGroundLayerField = async (
  component: DerivedAssetComponent,
  terrainRadius: number,
  cellSize: number,
  tones: Record<string, string>,
): Promise<GroundLayerField> => {
  const [world, [originX, , originZ]] = await Promise.all([readWorldOptions(component), readWorldOrigin(component)]);
  if (!world) throw new InvalidOperationError(Operation.Read, component, "has no world");
  const textureDirectory = join(getComponentDirectory(component).assets, AssetType.Texture2D);
  const classify = createGroundToneClassifier(tones);
  const tilePoints = await Promise.all(
    world.terrainTiles.map(async ({ name }) => {
      const { column, row } = parseTerrainTileName(name);
      const { data, info } = await sharp(join(textureDirectory, `${name}${TERRAIN_BASE_MAP_SUFFIX}.png`))
        .raw()
        .toBuffer({ resolveWithObject: true });
      const texelWidth = TERRAIN_TILE_SIZE / info.width;
      const texelHeight = TERRAIN_TILE_SIZE / info.height;
      const points: { layer: string; x: number; z: number }[] = [];
      for (let texelRow = 0; texelRow < info.height; texelRow++)
        for (let texelColumn = 0; texelColumn < info.width; texelColumn++) {
          const x = column * TERRAIN_TILE_SIZE + (texelColumn + 0.5) * texelWidth - originX;
          const z = originZ - (row * TERRAIN_TILE_SIZE + (info.height - texelRow - 0.5) * texelHeight);
          if (Math.hypot(x, z) > terrainRadius) continue;
          const offset = (texelRow * info.width + texelColumn) * info.channels;
          points.push({ layer: classify([data[offset] ?? 0, data[offset + 1] ?? 0, data[offset + 2] ?? 0]), x, z });
        }
      return points;
    }),
  );
  const nodeCount = Math.ceil((2 * terrainRadius) / cellSize) + 1;
  return computeGroundLayerField(tilePoints.flat(), {
    cellSize,
    origin: [-terrainRadius, -terrainRadius],
    size: [nodeCount, nodeCount],
  });
};
