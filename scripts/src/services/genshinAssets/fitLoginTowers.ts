import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";
import type { LatheProfile } from "#src/models/genshinAssets/LatheProfile";

import { TOWER_BAND_HEIGHT, TOWER_RADIUS_TOLERANCE } from "#src/services/genshinAssets/constants";
import { fitLatheProfile } from "#src/services/genshinAssets/fitLatheProfile";
import { readObjMesh } from "#src/services/genshinAssets/readObjMesh";
import { roundFitted } from "#src/services/genshinAssets/roundFitted";
import { toRightHanded } from "#src/services/genshinAssets/toRightHanded";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Quaternion, Vector3 } from "three";

// A tower's mesh at one level of detail, the tower being its name without the level
const TOWER_MESH_REGEX = /^(?<tower>LoginScene_Build\d+_\d+)_Lod(?<level>\d)$/u;
// The login scene's towers as lathes: each tower's profile from its most detailed mesh, and one instance wherever any
// Level of detail of it stands, at its fitted axis's foot and its scale
export const fitLoginTowers = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{
  placements: { position: [number, number, number]; scale: number; tower: string }[];
  profiles: Record<string, LatheProfile["sections"]>;
}> => {
  const towerPlacements = placements.flatMap((placement) => {
    const groups = TOWER_MESH_REGEX.exec(placement.mesh)?.groups;
    return groups?.tower ? [{ ...placement, level: Number(groups.level), tower: groups.tower }] : [];
  });
  const profiles = new Map<string, LatheProfile>();
  for (const tower of new Set(towerPlacements.map((placement) => placement.tower))) {
    const levels = new Set(towerPlacements.filter((placement) => placement.tower === tower).map(({ level }) => level));
    const meshPath = [...levels]
      .toSorted((firstLevel, secondLevel) => firstLevel - secondLevel)
      .map((level) => join(meshDirectory, `${tower}_Lod${level}.obj`))
      .find((path) => existsSync(path));
    if (!meshPath) continue;
    // oxlint-disable-next-line no-await-in-loop -- one mesh of tens of thousands of vertices is read at a time
    const { vertices } = await readObjMesh(meshPath);
    profiles.set(
      tower,
      fitLatheProfile(vertices, { bandHeight: TOWER_BAND_HEIGHT, tolerance: TOWER_RADIUS_TOLERANCE }),
    );
  }
  const instances = new Map<string, { position: [number, number, number]; scale: number; tower: string }>();
  for (const { position, rotation, scale, tower } of towerPlacements) {
    const profile = profiles.get(tower);
    if (!profile) continue;
    const foot = new Vector3(profile.axis[0], profile.foot, profile.axis[1])
      .multiply(new Vector3(...scale))
      .applyQuaternion(new Quaternion(...rotation))
      .add(new Vector3(...position));
    const [x = 0, y = 0, z = 0] = toRightHanded(foot.toArray()).map((value) => roundFitted(value));
    instances.set(`${tower}|${x},${y},${z}`, { position: [x, y, z], scale: roundFitted(scale[0]), tower });
  }
  return {
    placements: [...instances.values()],
    profiles: Object.fromEntries(
      [...profiles.entries()]
        .toSorted(([a], [b]) => a.localeCompare(b))
        .map(([tower, { sections }]) => [
          tower,
          sections.map(({ bottomRadius, height, topRadius }) => ({
            bottomRadius: roundFitted(bottomRadius),
            height: roundFitted(height),
            topRadius: roundFitted(topRadius),
          })),
        ]),
    ),
  };
};
