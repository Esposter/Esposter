import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { Texture } from "#src/models/genshinAssets/fit/Texture";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { Vector } from "#src/models/shared/Vector";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { clusterCardCentres } from "#src/services/genshinAssets/fit/clusterCardCentres";
import { computeNormalField } from "#src/services/genshinAssets/fit/computeNormalField";
import { computeTriangleArea } from "#src/services/genshinAssets/fit/computeTriangleArea";
import { computeVertexNormals } from "#src/services/genshinAssets/fit/computeVertexNormals";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { sampleFaceUvs } from "#src/services/genshinAssets/fit/sampleFaceUvs";
import { sampleSurfaceTexture } from "#src/services/genshinAssets/fit/sampleSurfaceTexture";
import { toWorldVertices } from "#src/services/genshinAssets/fit/toWorldVertices";
import { traceRootCentrelines } from "#src/services/genshinAssets/fit/traceRootCentrelines";
import {
  CUTOFF_PROPERTY,
  OAK_BARK_MESH,
  OAK_CLUSTER_COUNT,
  OAK_CLUSTER_SEED,
  OAK_LEAF_MESH,
  OAK_NORMAL_CELL_SIZE,
  OAK_ROOT_LEVEL_STEP,
  OAK_ROOT_SUBMESH,
  OAK_ROOT_TOLERANCE,
  OAK_TRUNK_HEIGHTS,
  OAK_TRUNK_REACH,
  OAK_TRUNK_SLAB_HALF_HEIGHT,
} from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { nameMeshPlacements } from "#src/services/genshinAssets/shared/nameMeshPlacements";
import { readAssetNames } from "#src/services/genshinAssets/shared/readAssetNames";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toDiffusePath } from "#src/services/genshinAssets/shared/toDiffusePath";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { getPercentile } from "#src/services/shared/getPercentile";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import sharp from "sharp";
import { Quaternion, Vector3 } from "three";

// The bark's radius at a station is its 90th percentile, a stray sliver of bark not setting it
const BARK_RADIUS_FRACTION = 0.9;

// A mesh's faces, vertices and vertex normals in three's axes, placed where its placement stands it and taken round the
// Oak's foot, the origin's place in the game's axes, so every point it yields is placed as every other fit's are, with
// Its faces' texture coordinates as the file holds them
const readMeshInThree = async (
  path: string,
  placement: AssetPlacement,
  origin: readonly [number, number, number],
): Promise<
  Pick<Awaited<ReturnType<typeof readObjMesh>>, "faceGroups" | "faces" | "faceUvs" | "uvs"> & {
    normals: (undefined | Vector)[];
    vertices: Vector[];
  }
> => {
  const mesh = await readObjMesh(path);
  const [originX, originY, originZ] = origin;
  const rotation = new Quaternion(...placement.rotation);
  const normal = new Vector3();
  return {
    faceGroups: mesh.faceGroups,
    faces: mesh.faces,
    faceUvs: mesh.faceUvs,
    normals: computeVertexNormals(mesh).map((vertexNormal) => {
      if (!vertexNormal) return undefined;
      normal.set(...vertexNormal).applyQuaternion(rotation);
      return toRightHanded(normal.toArray());
    }),
    uvs: mesh.uvs,
    vertices: toWorldVertices(mesh.vertices, placement).map(([x, y, z]) =>
      toRightHanded([x - originX, y - originY, z - originZ]),
    ),
  };
};
// The texture a placed material cuts its cards with and the alpha it cuts them at, read off its export: its diffuse and
// Its cutoff, each found by its path ID through the asset index's names
const readCutTexture = async (materialPathId: string): Promise<{ cutoff: number; texture: Texture }> => {
  const materials = await readComponentMaterials(DerivedAssetComponent.Windrise);
  const pathIdNameMap = await readAssetNames(
    new Set([
      materialPathId,
      ...materials.flatMap(({ textures }) => Object.values(textures).map(({ pathId }) => pathId)),
    ]),
  );
  const material = materials.find(({ name }) => name === pathIdNameMap.get(materialPathId));
  const textureDirectory = join(getComponentDirectory(DerivedAssetComponent.Windrise).assets, AssetType.Texture2D);
  const path = toDiffusePath(textureDirectory, material, pathIdNameMap);
  const cutoff = material?.floats[CUTOFF_PROPERTY];
  if (path === undefined || cutoff === undefined)
    throw new InvalidOperationError(Operation.Read, materialPathId, "has no diffuse texture or cutoff exported");
  return { cutoff, texture: await sharp(path).raw().toBuffer({ resolveWithObject: true }) };
};
// The export's placement of one of the oak's meshes, the mesh it draws by name
const findOakPlacement = (placements: AssetPlacement[], mesh: string): AssetPlacement => {
  const placement = placements.find((candidate) => candidate.mesh === mesh);
  if (!placement) throw new InvalidOperationError(Operation.Read, DerivedAssetComponent.Windrise, `places no ${mesh}`);
  return placement;
};
// The great oak's canopy, trunk and surface roots read off its export's Lod1 meshes, in three's axes round its foot: each
// Leaf triangle's centroid, the centre of the card it is half of, with the leaf it keeps (its area times the share of
// Its texture its material's cutoff keeps), grouped into the clusters `clusterCardCentres` finds, the bark's radius at
// Each trunk station, and its roots' submesh traced into the centrelines their tubes are swept along, as the record
// `windrise/oak` with its report
export const fitWindriseOak = async (): Promise<GameDataBuild> => {
  const meshDirectory = join(getComponentDirectory(DerivedAssetComponent.Windrise).assets, AssetType.Mesh);
  const [placements, origin] = await Promise.all([
    readComponentPlacements(DerivedAssetComponent.Windrise),
    readWorldOrigin(DerivedAssetComponent.Windrise),
  ]);
  await nameMeshPlacements(placements);
  const leafPlacement = findOakPlacement(placements, OAK_LEAF_MESH);
  const [leaf, { cutoff, texture }] = await Promise.all([
    readMeshInThree(join(meshDirectory, `${OAK_LEAF_MESH}.obj`), leafPlacement, origin),
    readCutTexture(leafPlacement.materials[0] ?? ""),
  ]);
  const bark = await readMeshInThree(
    join(meshDirectory, `${OAK_BARK_MESH}.obj`),
    findOakPlacement(placements, OAK_BARK_MESH),
    origin,
  );
  const cards = leaf.faces.flatMap(([first, second, third], face): { centre: Vector; leafArea: number }[] => {
    const a = leaf.vertices[first];
    const b = leaf.vertices[second];
    const c = leaf.vertices[third];
    const [firstUv, secondUv, thirdUv] = (leaf.faceUvs[face] ?? []).map((index) => leaf.uvs[index]);
    if (!a || !b || !c || !firstUv || !secondUv || !thirdUv) return [];
    const points = sampleFaceUvs([firstUv, secondUv, thirdUv], texture.info);
    const keptShare =
      points.filter((uv) => sampleSurfaceTexture(texture, uv).coverage >= cutoff).length / points.length;
    return [
      {
        centre: [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3],
        leafArea: computeTriangleArea(a, b, c) * keptShare,
      },
    ];
  });
  const clusters = clusterCardCentres(cards, OAK_CLUSTER_COUNT, OAK_CLUSTER_SEED);
  // The leaves' normals, averaged on a grid: the game's is a smooth field over the crown, where the cards point out from
  // Each cluster's centre instead
  const normalField = computeNormalField(
    leaf.vertices.flatMap((position, index) => {
      const normal = leaf.normals[index];
      return normal ? [{ normal, position }] : [];
    }),
    OAK_NORMAL_CELL_SIZE,
  );
  const trunk = OAK_TRUNK_HEIGHTS.map((height) => {
    const radius = getPercentile(
      bark.vertices.flatMap(([x, y, z]) =>
        Math.abs(y - height) <= OAK_TRUNK_SLAB_HALF_HEIGHT && Math.hypot(x, z) <= OAK_TRUNK_REACH
          ? [Math.hypot(x, z)]
          : [],
      ),
      BARK_RADIUS_FRACTION,
    );
    if (Number.isNaN(radius))
      throw new InvalidOperationError(Operation.Read, OAK_BARK_MESH, `has no bark at the trunk's height ${height}`);
    return { height, radius: roundFitted(radius) };
  });
  const rootGroup = `${OAK_BARK_MESH}_${OAK_ROOT_SUBMESH}`;
  const roots = traceRootCentrelines(
    bark.vertices,
    bark.faces.filter((_face, index) => bark.faceGroups[index] === rootGroup),
    { levelStep: OAK_ROOT_LEVEL_STEP, tolerance: OAK_ROOT_TOLERANCE },
  );
  if (roots.length === 0) throw new InvalidOperationError(Operation.Read, rootGroup, "has no surface roots");
  return {
    notes: [
      `oak: ${clusters.length} clusters over ${cards.length} leaf triangles, trunk ${trunk.length} stations, ${roots.length} roots through ${roots.reduce((sum, root) => sum + root.length, 0)} points`,
    ],
    objects: {
      "windrise/oak": {
        clusters: clusters.map(({ leafArea, radius, x, y, z }) => ({
          leafArea: roundFitted(leafArea),
          radius: roundFitted(radius),
          x: roundFitted(x),
          y: roundFitted(y),
          z: roundFitted(z),
        })),
        normalField,
        roots: roots.map((root) =>
          root.map(({ radius, x, y, z }) => ({
            radius: roundFitted(radius),
            x: roundFitted(x),
            y: roundFitted(y),
            z: roundFitted(z),
          })),
        ),
        trunk,
      },
    },
  };
};
