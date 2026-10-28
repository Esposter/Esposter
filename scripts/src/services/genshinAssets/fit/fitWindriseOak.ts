import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { Vector } from "#src/models/shared/Vector";
import type { TreeTube } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { clusterCardCentres } from "#src/services/genshinAssets/fit/clusterCardCentres";
import { computeNormalField } from "#src/services/genshinAssets/fit/computeNormalField";
import { computeTriangleArea } from "#src/services/genshinAssets/fit/computeTriangleArea";
import { countPoints } from "#src/services/genshinAssets/fit/countPoints";
import { findOakPlacement } from "#src/services/genshinAssets/fit/findOakPlacement";
import { readCutTexture } from "#src/services/genshinAssets/fit/readCutTexture";
import { readMeshInThree } from "#src/services/genshinAssets/fit/readMeshInThree";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { sampleFaceUvs } from "#src/services/genshinAssets/fit/sampleFaceUvs";
import { sampleSurfaceTexture } from "#src/services/genshinAssets/fit/sampleSurfaceTexture";
import { toRecordTubes } from "#src/services/genshinAssets/fit/toRecordTubes";
import { traceTubeCentrelines } from "#src/services/genshinAssets/fit/traceTubeCentrelines";
import {
  OAK_BARK_MESH,
  OAK_CLUSTER_COUNT,
  OAK_CLUSTER_SEED,
  OAK_LEAF_MESH,
  OAK_LIMB_SUBMESH,
  OAK_NORMAL_CELL_SIZE,
  OAK_ROOT_SUBMESH,
  OAK_TUBE_LEVEL_STEP,
  OAK_TUBE_TOLERANCE,
} from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { nameMeshPlacements } from "#src/services/genshinAssets/shared/nameMeshPlacements";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";

// The great oak's canopy, trunk, limbs and surface roots read off its export's Lod1 meshes, in three's axes round its
// Foot: each leaf triangle's centroid, the centre of the card it is half of, with the leaf it keeps (its area times the
// Share of its texture its material's cutoff keeps), grouped into the clusters `clusterCardCentres` finds, and the
// Bark's trunk and roots submeshes each traced into the centrelines their tubes are swept along, the trunk from its
// Foot, as the record `windrise/oak` with its report
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
  const traceBarkSubmesh = (submesh: number, hasTrunk: boolean): TreeTube[] => {
    const group = `${OAK_BARK_MESH}_${submesh}`;
    const tubes = traceTubeCentrelines(
      bark.vertices,
      bark.faces.filter((_face, index) => bark.faceGroups[index] === group),
      { hasTrunk, levelStep: OAK_TUBE_LEVEL_STEP, tolerance: OAK_TUBE_TOLERANCE },
    );
    if (tubes.length === 0) throw new InvalidOperationError(Operation.Read, group, "has no tubes");
    return tubes;
  };
  const limbs = traceBarkSubmesh(OAK_LIMB_SUBMESH, true);
  const roots = traceBarkSubmesh(OAK_ROOT_SUBMESH, false);
  return {
    notes: [
      `oak: ${clusters.length} clusters over ${cards.length} leaf triangles, trunk and ${limbs.length - 1} limbs through ${countPoints(limbs)} points, ${roots.length} roots through ${countPoints(roots)} points`,
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
        limbs: toRecordTubes(limbs),
        normalField,
        roots: toRecordTubes(roots),
      },
    },
  };
};
