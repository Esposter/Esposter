import type { FittedFamily } from "#src/models/genshinAssets/fit/FittedFamily";
import type { FittedSurface } from "#src/models/genshinAssets/fit/FittedSurface";
import type { SurfaceDetail } from "#src/models/genshinAssets/fit/SurfaceDetail";
import type { SurfaceSample } from "#src/models/genshinAssets/fit/SurfaceSample";
import type { Texture } from "#src/models/genshinAssets/fit/Texture";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Vector } from "#src/models/shared/Vector";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { averageSurfaceDetails, computeTextureDetail } from "#src/services/genshinAssets/fit/computeTextureDetail";
import { computePartSurfaces } from "#src/services/genshinAssets/fit/computePartSurfaces";
import { computeSurfaceTones } from "#src/services/genshinAssets/fit/computeSurfaceTones";
import { sampleFaceUvs } from "#src/services/genshinAssets/fit/sampleFaceUvs";
import { sampleSurfaceTexture } from "#src/services/genshinAssets/fit/sampleSurfaceTexture";
import { toWorldVertices } from "#src/services/genshinAssets/fit/toWorldVertices";
import {
  MAIN_TEXTURE_SLOT,
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
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import sharp from "sharp";

type ObjMesh = Awaited<ReturnType<typeof readObjMesh>>;
// A placed mesh or a terrain tile read apart: its part, its samples, and the detail of the texture it was read through
interface ReadSurface {
  detail?: SurfaceDetail;
  part: string;
  samples: SurfaceSample[];
}

// A face's submesh, named for its index among its renderer's materials
const SUBMESH_REGEX = /_(?<submesh>\d+)$/u;
const OBJ_EXTENSION = ".obj";

const readTexture = (path: string): Promise<Texture> => sharp(path).raw().toBuffer({ resolveWithObject: true });
// The area of a triangle from its corners
const computeTriangleArea = ([ax, ay, az]: Vector, [bx, by, bz]: Vector, [cx, cy, cz]: Vector): number => {
  const [ux, uy, uz] = [bx - ax, by - ay, bz - az];
  const [vx, vy, vz] = [cx - ax, cy - ay, cz - az];
  return Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
};
// The samples of a mesh's faces where its vertices stand in the world. Each face is read at the points `sampleFaceUvs`
// Spreads over its UV triangle, through the texture its submesh draws with (`diffuses`, by submesh index), each point
// Weighted by an equal share of the face's world area and how far its texel is covered, and tagged with the `part` it
// Is read for. A face whose centroid `checkKept` refuses counts for nothing
const readFaceSamples = (
  { faceGroups, faces, faceUvs, uvs }: ObjMesh,
  world: Vector[],
  diffuses: (Texture | undefined)[],
  part: string,
  checkKept: (centroid: Vector) => boolean = () => true,
): SurfaceSample[] =>
  faces.flatMap(([firstIndex, secondIndex, thirdIndex], face) => {
    const [first, second, third] = [world[firstIndex], world[secondIndex], world[thirdIndex]];
    const submesh = Number(SUBMESH_REGEX.exec(faceGroups[face] ?? "")?.groups?.submesh ?? 0);
    const diffuse = diffuses[submesh];
    if (!first || !second || !third || !diffuse) return [];
    const centroid = ([0, 1, 2] as const).map((axis) => (first[axis] + second[axis] + third[axis]) / 3) as Vector;
    if (!checkKept(centroid)) return [];
    const [firstUv, secondUv, thirdUv] = (faceUvs[face] ?? [0, 0, 0]).map((index) => uvs[index] ?? [0, 0]) as [
      [number, number],
      [number, number],
      [number, number],
    ];
    const points = sampleFaceUvs([firstUv, secondUv, thirdUv], diffuse.info);
    const weight = computeTriangleArea(first, second, third) / points.length;
    return points.map((uv) => {
      const { colour, coverage } = sampleSurfaceTexture(diffuse, uv);
      return { colour, part, weight: weight * coverage };
    });
  });
// Each family's surface as its export's textures paint it, returned as the colour and palette `computeSurfaceTones`
// Reads off the samples its meshes give, and each part's apart as `computePartSurfaces` reads them. A family's meshes
// Are its placed meshes, each drawn with its submeshes' diffuse textures, and its terrain tiles, each drawn with its base
// Map and read only where its faces stand within the terrain radius of the world's origin, the ground beyond which the
// Screen never shows. Every face is read where it stands in the world and weighted by its area there. Writes no file: the
// Caller writes what this returns
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
  // The exported diffuse texture a placed material draws with, if it was exported
  const getDiffusePath = (materialPathId: string): string | undefined => {
    const material = materialMap.get(pathIdNameMap.get(materialPathId) ?? "");
    const textureName = pathIdNameMap.get(material?.textures[MAIN_TEXTURE_SLOT]?.pathId ?? "");
    const path = textureName === undefined ? undefined : join(textureDirectory, `${textureName}.png`);
    return path && existsSync(path) ? path : undefined;
  };
  const textures = new Map<string, Promise<Texture>>();
  const getTexture = (path: string): Promise<Texture> => {
    const texture = textures.get(path) ?? readTexture(path);
    textures.set(path, texture);
    return texture;
  };
  // A placed mesh is one part, named by its mesh, since a material can span parts: the statue's stone levels all draw one
  // Material, and its gold dish sits in it
  const readPlacementSurface = async (placement: AssetPlacement): Promise<ReadSurface> => {
    const mesh = await readObjMesh(join(meshDirectory, `${placement.mesh}${OBJ_EXTENSION}`));
    const diffuses = await Promise.all(
      placement.materials.map(async (materialPathId) => {
        const path = getDiffusePath(materialPathId);
        const texture = path === undefined ? undefined : await getTexture(path);
        return texture;
      }),
    );
    const texture = diffuses.find((diffuse) => diffuse !== undefined);
    return {
      detail: texture && computeTextureDetail(texture),
      part: placement.mesh,
      samples: readFaceSamples(mesh, toWorldVertices(mesh.vertices, placement), diffuses, placement.mesh),
    };
  };
  // A terrain tile is never placed: its vertices are local to its column and row, which are its offset in the world
  const readTerrainSurface = async (tile: string): Promise<ReadSurface> => {
    const mesh = await readObjMesh(join(meshDirectory, `${tile}${OBJ_EXTENSION}`));
    const { column, row } = TERRAIN_TILE_REGEX.exec(tile)?.groups ?? {};
    const [offsetX, offsetZ] = [Number(column) * TERRAIN_TILE_SIZE, Number(row) * TERRAIN_TILE_SIZE];
    const world = mesh.vertices.map(([x, y, z]): Vector => [x + offsetX, y, z + offsetZ]);
    const baseMap = join(textureDirectory, `${tile}${TERRAIN_BASE_MAP_SUFFIX}.png`);
    const diffuses = [existsSync(baseMap) ? await getTexture(baseMap) : undefined];
    return {
      detail: diffuses[0] && computeTextureDetail(diffuses[0]),
      part: "",
      samples: readFaceSamples(
        mesh,
        world,
        diffuses,
        "",
        ([x, , z]) => Math.hypot(x - originX, z - originZ) <= terrainRadius,
      ),
    };
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
  // A surface's detail as the mean of the textures its reads drew, or the surface itself when none drew a texture
  const withDetail = <Surface extends FittedSurface>(surface: Surface, details: readonly SurfaceDetail[]): Surface => {
    const detail = averageSurfaceDetails(details);
    return detail === undefined ? surface : { ...surface, detail };
  };
  // The part surfaces, each with the detail of the textures its own placed meshes drew
  const withPartDetails = (
    parts: Record<string, FittedSurface>,
    reads: readonly ReadSurface[],
  ): Record<string, FittedSurface> =>
    Object.fromEntries(
      Object.entries(parts).map(([part, surface]) => [
        part,
        withDetail(
          surface,
          reads.flatMap((read) => (read.part === part && read.detail ? [read.detail] : [])),
        ),
      ]),
    );
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
        const familySurface = withDetail(
          computeSurfaceTones(samples),
          reads.flatMap((read) => (read.detail ? [read.detail] : [])),
        );
        return [family, { ...familySurface, parts: withPartDetails(computePartSurfaces(samples), reads) }] as const;
      }),
    ),
  ) as Record<Family, FittedFamily>;
};
