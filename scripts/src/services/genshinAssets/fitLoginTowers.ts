import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";
import type { LatheProfile } from "#src/models/genshinAssets/LatheProfile";

import {
  ROTATION_DECIMALS,
  TOWER_BAND_HEIGHT,
  TOWER_MESH_REGEX,
  TOWER_RADIUS_TOLERANCE,
} from "#src/services/genshinAssets/constants";
import { fitLatheProfile } from "#src/services/genshinAssets/fitLatheProfile";
import { readLevelOfDetailParts } from "#src/services/genshinAssets/readLevelOfDetailParts";
import { readObjMesh } from "#src/services/genshinAssets/readObjMesh";
import { roundFitted } from "#src/services/genshinAssets/roundFitted";
import { toRightHanded } from "#src/services/genshinAssets/toRightHanded";
import { toRightHandedRotation } from "#src/services/genshinAssets/toRightHandedRotation";
import { Quaternion, Vector3 } from "three";

// Where the login scene stands its towers: one instance wherever any level of detail of a tower stands, at the foot of
// The axis its most detailed mesh is fitted round, turned as the game turns it, at its scale. Each tower's lathe and
// Surface are `fitLoginTowerFacades`'s
export const fitLoginTowers = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{
  placements: { position: [number, number, number]; rotation: number[]; scale: number; tower: string }[];
}> => {
  const { meshPathMap, partPlacements } = readLevelOfDetailParts(placements, TOWER_MESH_REGEX, meshDirectory);
  const profiles = new Map<string, LatheProfile>();
  for (const [tower, meshPath] of meshPathMap) {
    // oxlint-disable-next-line no-await-in-loop -- one mesh of tens of thousands of vertices is read at a time
    const { vertices } = await readObjMesh(meshPath);
    profiles.set(
      tower,
      fitLatheProfile(vertices, { bandHeight: TOWER_BAND_HEIGHT, tolerance: TOWER_RADIUS_TOLERANCE }),
    );
  }
  const instances = new Map<
    string,
    { position: [number, number, number]; rotation: number[]; scale: number; tower: string }
  >();
  for (const { part: tower, position, rotation, scale } of partPlacements) {
    const profile = profiles.get(tower);
    if (!profile) continue;
    const foot = new Vector3(profile.axis[0], profile.foot, profile.axis[1])
      .multiply(new Vector3(...scale))
      .applyQuaternion(new Quaternion(...rotation))
      .add(new Vector3(...position));
    const [x = 0, y = 0, z = 0] = toRightHanded(foot.toArray()).map((value) => roundFitted(value));
    instances.set(`${tower}|${x},${y},${z}`, {
      position: [x, y, z],
      rotation: toRightHandedRotation(rotation).map(
        (value) => Math.round(value * ROTATION_DECIMALS) / ROTATION_DECIMALS,
      ),
      scale: roundFitted(scale[0]),
      tower,
    });
  }
  return { placements: [...instances.values()] };
};
