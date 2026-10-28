import type { FittedFamily } from "#src/models/genshinAssets/fit/FittedFamily";
import type { ReadSurface } from "#src/models/genshinAssets/fit/ReadSurface";
import type { Texture } from "#src/models/genshinAssets/fit/Texture";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Vector } from "#src/models/shared/Vector";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { computePartSurfaces } from "#src/services/genshinAssets/fit/computePartSurfaces";
import { computeSurfaceTones } from "#src/services/genshinAssets/fit/computeSurfaceTones";
import { readSurface } from "#src/services/genshinAssets/fit/readSurface";
import { readTexture } from "#src/services/genshinAssets/fit/readTexture";
import { tintTexture } from "#src/services/genshinAssets/fit/tintTexture";
import { toWorldVertices } from "#src/services/genshinAssets/fit/toWorldVertices";
import { withDetail } from "#src/services/genshinAssets/fit/withDetail";
import { withPartDetails } from "#src/services/genshinAssets/fit/withPartDetails";
import {
  MAIN_COLOUR_PROPERTY,
  TERRAIN_BASE_MAP_SUFFIX,
  TERRAIN_TILE_REGEX,
  TERRAIN_TILE_SIZE,
} from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { nameMeshPlacements } from "#src/services/genshinAssets/shared/nameMeshPlacements";
import { readAssetNames } from "#src/services/genshinAssets/shared/readAssetNames";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toDiffusePath } from "#src/services/genshinAssets/shared/toDiffusePath";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";

const OBJ_EXTENSION = ".obj";

// Each family's surface as its export's textures paint it, returned as the colour and palette `computeSurfaceTones`
// Reads off the samples its meshes give, and each part's apart as `computePartSurfaces` reads them. A family's meshes
// Are its placed meshes, each drawn with its submeshes' diffuse textures under their materials' tints as the witness
// Draws them, and its terrain tiles, each drawn with its base map and read only where its faces stand within the terrain
// Radius of the world's origin, the ground beyond which the screen never shows. Every face is read where it stands in
// The world and weighted by its area there. Writes no file: the caller writes what this returns
export const fitSurfaceColours = async <Family extends string>(
  component: DerivedAssetComponent,
  meshRegexMap: Record<Family, RegExp>,
  terrainRadius: number,
): Promise<Record<Family, FittedFamily>> => {
  const directory = getComponentDirectory(component);
  const meshDirectory = join(directory.assets, AssetType.Mesh);
  const textureDirectory = join(directory.assets, AssetType.Texture2D);
  const [placements, materialValues, meshFiles, [originX, , originZ]] = await Promise.all([
    readComponentPlacements(component, { isCopied: true }),
    readComponentMaterials(component),
    readdir(meshDirectory),
    readWorldOrigin(component),
  ]);
  await nameMeshPlacements(placements);
  const materialMap = new Map(materialValues.map((material) => [material.name, material]));
  const pathIdNameMap = await readAssetNames(
    new Set([
      ...placements.flatMap((placement) => placement.materials),
      ...materialValues.flatMap((material) => Object.values(material.textures).map(({ pathId }) => pathId)),
    ]),
  );
  const pathTextureMap = new Map<string, Promise<Texture>>();
  const getTexture = (path: string): Promise<Texture> => {
    const texture = pathTextureMap.get(path) ?? readTexture(path);
    pathTextureMap.set(path, texture);
    return texture;
  };
  // The exported diffuse texture a placed material draws with, if it was exported, tinted by the material's main colour
  // As the witness draws it, so a family reads the colour its exports show rather than its texture's own
  const materialPathDiffuseMap = new Map<string, Promise<Texture | undefined>>();
  const readDiffuse = async (materialPathId: string): Promise<Texture | undefined> => {
    const material = materialMap.get(pathIdNameMap.get(materialPathId) ?? "");
    const path = toDiffusePath(textureDirectory, material, pathIdNameMap);
    if (path === undefined) return undefined;
    const [red = 1, green = 1, blue = 1] = material?.colors[MAIN_COLOUR_PROPERTY] ?? [];
    return tintTexture(await getTexture(path), [red, green, blue]);
  };
  const getDiffuse = (materialPathId: string): Promise<Texture | undefined> => {
    const diffuse = materialPathDiffuseMap.get(materialPathId) ?? readDiffuse(materialPathId);
    materialPathDiffuseMap.set(materialPathId, diffuse);
    return diffuse;
  };
  // A placed mesh is one part, named by its mesh, since a material can span parts: the statue's stone levels all draw one
  // Material, and its gold dish sits in it
  const readPlacementSurface = async (placement: AssetPlacement): Promise<ReadSurface> => {
    const mesh = await readObjMesh(join(meshDirectory, `${placement.mesh}${OBJ_EXTENSION}`));
    const diffuses = await Promise.all(placement.materials.map((materialPathId) => getDiffuse(materialPathId)));
    return readSurface(mesh, toWorldVertices(mesh.vertices, placement), diffuses, placement.mesh);
  };
  // A terrain tile is never placed: its vertices are local to its column and row, which are its offset in the world
  const readTerrainSurface = async (tile: string): Promise<ReadSurface> => {
    const mesh = await readObjMesh(join(meshDirectory, `${tile}${OBJ_EXTENSION}`));
    const { column, row } = TERRAIN_TILE_REGEX.exec(tile)?.groups ?? {};
    const [offsetX, offsetZ] = [Number(column) * TERRAIN_TILE_SIZE, Number(row) * TERRAIN_TILE_SIZE];
    const world = mesh.vertices.map(([x, y, z]): Vector => [x + offsetX, y, z + offsetZ]);
    const baseMap = join(textureDirectory, `${tile}${TERRAIN_BASE_MAP_SUFFIX}.png`);
    const diffuses = [existsSync(baseMap) ? await getTexture(baseMap) : undefined];
    return readSurface(mesh, world, diffuses, "", ([x, , z]) => Math.hypot(x - originX, z - originZ) <= terrainRadius);
  };
  const readFamilySurfaces = async (regex: RegExp): Promise<ReadSurface[]> => {
    const placed = await Promise.all(
      placements.filter(({ mesh }) => regex.test(mesh)).map((placement) => readPlacementSurface(placement)),
    );
    const tiles = meshFiles
      .filter((file) => file.endsWith(OBJ_EXTENSION))
      .map((file) => basename(file, OBJ_EXTENSION))
      .filter((tile) => regex.test(tile) && TERRAIN_TILE_REGEX.test(tile));
    const terrain = await Promise.all(tiles.map((tile) => readTerrainSurface(tile)));
    return [...placed, ...terrain];
  };
  return Object.fromEntries(
    await Promise.all(
      (Object.entries(meshRegexMap) as [Family, RegExp][]).map(async ([family, regex]) => {
        const reads = await readFamilySurfaces(regex);
        const samples = reads.flatMap((read) => read.samples);
        if (!samples.some(({ weight }) => weight > 0))
          throw new InvalidOperationError(
            Operation.Read,
            family,
            "has no placed mesh or terrain tile whose covered faces can be read",
          );
        const familySurface = withDetail(computeSurfaceTones(samples), reads);
        return [family, { ...familySurface, parts: withPartDetails(computePartSurfaces(samples), reads) }] as const;
      }),
    ),
  ) as Record<Family, FittedFamily>;
};
