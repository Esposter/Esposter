import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { Vector } from "#src/models/shared/Vector";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { clusterCardCentres } from "#src/services/genshinAssets/fit/clusterCardCentres";
import { computeNormalField } from "#src/services/genshinAssets/fit/computeNormalField";
import { computeVertexNormals } from "#src/services/genshinAssets/fit/computeVertexNormals";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toWorldVertices } from "#src/services/genshinAssets/fit/toWorldVertices";
import {
  OAK_BARK_MESH,
  OAK_CLUSTER_COUNT,
  OAK_CLUSTER_SEED,
  OAK_LEAF_MESH,
  OAK_NORMAL_CELL_SIZE,
  OAK_TRUNK_HEIGHTS,
  OAK_TRUNK_REACH,
  OAK_TRUNK_SLAB_HALF_HEIGHT,
} from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { nameMeshPlacements } from "#src/services/genshinAssets/shared/nameMeshPlacements";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { getPercentile } from "#src/services/shared/getPercentile";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import { Quaternion, Vector3 } from "three";

// The bark's radius at a station is its 90th percentile, a stray sliver of bark not setting it
const BARK_RADIUS_FRACTION = 0.9;

// A mesh's faces, vertices and vertex normals in three's axes, placed where its placement stands it and taken round the
// Oak's foot, the origin's place in the game's axes, so every point it yields is placed as every other fit's are
const readMeshInThree = async (
  path: string,
  placement: AssetPlacement,
  origin: readonly [number, number, number],
): Promise<{ faces: [number, number, number][]; normals: (undefined | Vector)[]; vertices: Vector[] }> => {
  const mesh = await readObjMesh(path);
  const [originX, originY, originZ] = origin;
  const rotation = new Quaternion(...placement.rotation);
  const normal = new Vector3();
  return {
    faces: mesh.faces,
    normals: computeVertexNormals(mesh).map((vertexNormal) => {
      if (!vertexNormal) return undefined;
      normal.set(...vertexNormal).applyQuaternion(rotation);
      return toRightHanded(normal.toArray());
    }),
    vertices: toWorldVertices(mesh.vertices, placement).map(([x, y, z]) =>
      toRightHanded([x - originX, y - originY, z - originZ]),
    ),
  };
};
// The export's placement of one of the oak's meshes, the mesh it draws by name
const findOakPlacement = (placements: AssetPlacement[], mesh: string): AssetPlacement => {
  const placement = placements.find((candidate) => candidate.mesh === mesh);
  if (!placement) throw new InvalidOperationError(Operation.Read, DerivedAssetComponent.Windrise, `places no ${mesh}`);
  return placement;
};
// The great oak's canopy and trunk read off its export's Lod1 meshes, in three's axes round its foot: each leaf
// Triangle's centroid, the centre of the card it is half of, grouped into the clusters `clusterCardCentres` finds, and
// The bark's radius at each trunk station. Writes `windrise/oak.json` and returns the report and its path
export const fitWindriseOak = async (): Promise<string[]> => {
  const meshDirectory = join(getComponentDirectory(DerivedAssetComponent.Windrise).assets, AssetType.Mesh);
  const [placements, origin] = await Promise.all([
    readComponentPlacements(DerivedAssetComponent.Windrise),
    readWorldOrigin(DerivedAssetComponent.Windrise),
  ]);
  await nameMeshPlacements(placements);
  const leaf = await readMeshInThree(
    join(meshDirectory, `${OAK_LEAF_MESH}.obj`),
    findOakPlacement(placements, OAK_LEAF_MESH),
    origin,
  );
  const bark = await readMeshInThree(
    join(meshDirectory, `${OAK_BARK_MESH}.obj`),
    findOakPlacement(placements, OAK_BARK_MESH),
    origin,
  );
  const cardCentres = leaf.faces.flatMap(([first, second, third]): Vector[] => {
    const a = leaf.vertices[first];
    const b = leaf.vertices[second];
    const c = leaf.vertices[third];
    return a && b && c ? [[(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]] : [];
  });
  const clusters = clusterCardCentres(cardCentres, OAK_CLUSTER_COUNT, OAK_CLUSTER_SEED);
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
  const path = await writeWorldData("windrise/oak.json", {
    clusters: clusters.map(({ radius, x, y, z }) => ({
      radius: roundFitted(radius),
      x: roundFitted(x),
      y: roundFitted(y),
      z: roundFitted(z),
    })),
    normalField,
    trunk,
  });
  return [
    `oak: ${clusters.length} clusters over ${cardCentres.length} leaf triangles, trunk ${trunk.length} stations`,
    path,
  ];
};
