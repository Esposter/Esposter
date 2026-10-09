import type { Vector } from "#src/models/shared/Vector";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { clusterCardCentres } from "#src/services/genshinAssets/fit/clusterCardCentres";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import {
  OAK_BARK_MESH,
  OAK_CLUSTER_COUNT,
  OAK_CLUSTER_SEED,
  OAK_LEAF_MESH,
  OAK_TRUNK_HEIGHTS,
  OAK_TRUNK_REACH,
  OAK_TRUNK_SLAB_HALF_HEIGHT,
} from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { getPercentile } from "#src/services/shared/getPercentile";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";

// The bark's radius at a station is its 90th percentile, a stray sliver of bark not setting it
const BARK_RADIUS_FRACTION = 0.9;

// A mesh's faces and vertices in three's axes, so every point it yields is placed as every other fit's are
const readMeshInThree = async (path: string): Promise<{ faces: [number, number, number][]; vertices: Vector[] }> => {
  const { faces, vertices } = await readObjMesh(path);
  return { faces, vertices: vertices.map((vertex) => toRightHanded(vertex)) };
};
// The great oak's canopy and trunk read off its export's Lod1 meshes, in three's axes round its foot: each leaf
// Triangle's centroid, the centre of the card it is half of, grouped into the clusters `clusterCardCentres` finds, and
// The bark's radius at each trunk station. Writes `windrise/oak.json` and returns the report and its path
export const fitWindriseOak = async (): Promise<string[]> => {
  const meshDirectory = join(getComponentDirectory(DerivedAssetComponent.Windrise).assets, AssetType.Mesh);
  const leaf = await readMeshInThree(join(meshDirectory, `${OAK_LEAF_MESH}.obj`));
  const bark = await readMeshInThree(join(meshDirectory, `${OAK_BARK_MESH}.obj`));
  const cardCentres = leaf.faces.flatMap(([first, second, third]): Vector[] => {
    const a = leaf.vertices[first];
    const b = leaf.vertices[second];
    const c = leaf.vertices[third];
    return a && b && c ? [[(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]] : [];
  });
  const clusters = clusterCardCentres(cardCentres, OAK_CLUSTER_COUNT, OAK_CLUSTER_SEED);
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
    trunk,
  });
  return [
    `oak: ${clusters.length} clusters over ${cardCentres.length} leaf triangles, trunk ${trunk.length} stations`,
    path,
  ];
};
