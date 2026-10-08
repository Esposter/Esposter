import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SceneLayout } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import {
  MAIN_TEXTURE_SLOT,
  TERRAIN_BASE_MAP_SUFFIX,
  TERRAIN_TILE_SIZE,
} from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readAssetNames } from "#src/services/genshinAssets/shared/readAssetNames";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { selectFinestLevels } from "#src/services/genshinAssets/shared/selectFinestLevels";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { toRightHandedRotation } from "#src/services/genshinAssets/shared/toRightHandedRotation";
import { parseTerrainTileName } from "#src/services/genshinAssets/world/parseTerrainTileName";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

// A component's arrangement as the exports lay it out, for the witness render: each part at its finest level, in
// Three's axes, with every material it draws with and each material's values and textures, all named by the files the
// Export holds, under the component's roots or the ones given. It is written beside the exports and never enters the
// Repository (apps/web/content/docs/genshin/scene-derivation.md). A part of the open world is laid out round
// Its origin's place, as our scene stands round it, so a camera solved on the witness is our scene's camera, and its
// Terrain tiles at their corners, each drawn with its base map
export const writeWitnessLayout = async (
  component: DerivedAssetComponent,
  roots?: readonly string[],
): Promise<string> => {
  const directory = getComponentDirectory(component);
  const checkHasFile = (type: AssetType, name: string, extension: string): boolean =>
    existsSync(join(directory.assets, type, `${name}.${extension}`));
  const { world } = DerivedAssetComponentMap[component];
  const [placements, materials, [originX, originY, originZ]] = await Promise.all([
    readComponentPlacements(component, { isCopied: true, roots }),
    readComponentMaterials(component),
    world ? readWorldOrigin(component) : [0, 0, 0],
  ]);
  const toWitness = ([x = 0, y = 0, z = 0]: readonly number[]): [number, number, number] =>
    toRightHanded([x - originX, y - originY, z - originZ]);
  // A mesh a placement names by path ID (a skinned mesh in another file) is named through the asset index first
  const meshPathIds = new Set(placements.map(({ mesh }) => mesh).filter((mesh) => /^-?\d+$/u.test(mesh)));
  const meshAssets = await readIndexedAssets(({ pathId, type }) => type === AssetType.Mesh && meshPathIds.has(pathId));
  const pathIdMeshMap = new Map(meshAssets.map(({ name, pathId }) => [pathId, name]));
  for (const placement of placements) placement.mesh = pathIdMeshMap.get(placement.mesh) ?? placement.mesh;
  const drawn = selectFinestLevels(placements, (mesh) => checkHasFile(AssetType.Mesh, mesh, "obj"));
  const referencedIds = new Set([
    ...drawn.flatMap(({ materials: drawnMaterials }) => drawnMaterials),
    ...materials.flatMap(({ textures }) => Object.values(textures).map(({ pathId }) => pathId)),
  ]);
  const pathIdNameMap = await readAssetNames(referencedIds);
  const layout: SceneLayout = {
    materials: Object.fromEntries(
      materials.map(({ colors, floats, keywords, name, textures }) => [
        name,
        {
          colors,
          floats,
          keywords,
          name,
          textures: Object.fromEntries(
            Object.entries(textures).flatMap(([slot, { offset, pathId, scale }]) => {
              const textureName = pathIdNameMap.get(pathId) ?? "";
              return checkHasFile(AssetType.Texture2D, textureName, "png")
                ? [[slot, { name: textureName, offset, scale }]]
                : [];
            }),
          ),
        },
      ]),
    ),
    placements: drawn.map(({ materials: drawnMaterials, mesh, position, rotation, scale }) => ({
      materials: drawnMaterials.map((pathId) => pathIdNameMap.get(pathId) ?? pathId),
      mesh,
      position: toWitness(position),
      rotation: toRightHandedRotation(rotation),
      scale,
    })),
  };
  const terrainTiles = (world?.terrainTiles ?? []).filter(({ name }) => checkHasFile(AssetType.Mesh, name, "obj"));
  for (const { name } of terrainTiles) {
    const { column, row } = parseTerrainTileName(name);
    const baseMap = `${name}${TERRAIN_BASE_MAP_SUFFIX}`;
    layout.materials[name] = {
      colors: {},
      floats: {},
      keywords: [],
      name,
      textures: checkHasFile(AssetType.Texture2D, baseMap, "png")
        ? { [MAIN_TEXTURE_SLOT]: { name: baseMap, offset: [0, 0], scale: [1, 1] } }
        : {},
    };
    layout.placements.push({
      materials: [name],
      mesh: name,
      position: toWitness([column * TERRAIN_TILE_SIZE, 0, row * TERRAIN_TILE_SIZE]),
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    });
  }
  const path = join(directory.root, "witness.json");
  await writeFile(path, JSON.stringify(layout));
  return path;
};
