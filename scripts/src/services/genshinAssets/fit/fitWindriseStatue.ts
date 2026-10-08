import type { RadialProfile } from "#src/models/genshinAssets/fit/RadialProfile";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { assignSectionParts } from "#src/services/genshinAssets/fit/assignSectionParts";
import { fitRadialProfile } from "#src/services/genshinAssets/fit/fitRadialProfile";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import {
  STATUE_ANGLE_COUNT,
  STATUE_BAND_HEIGHT,
  STATUE_FIGURE_MESH_REGEX,
  STATUE_MESH_REGEX,
  STATUE_RADIUS_TOLERANCE,
} from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { nameMeshPlacements } from "#src/services/genshinAssets/shared/nameMeshPlacements";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { toRightHandedRotation } from "#src/services/genshinAssets/shared/toRightHandedRotation";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import { Matrix4, Quaternion, Vector3 } from "three";

// A placement's transform in three's axes
const toMatrix = ({ position, rotation, scale }: Pick<AssetPlacement, "position" | "rotation" | "scale">): Matrix4 =>
  new Matrix4().compose(
    new Vector3(...toRightHanded(position)),
    new Quaternion(...toRightHandedRotation(rotation)),
    new Vector3(...scale),
  );
// A part of the statue's stand or figure: the export part its section came from, and the stack its sections make from
// Its foot at its axis, in the statue's frame
interface StatueRun {
  part: string;
  position: number[];
  sections: RadialProfile["sections"];
}
// The meshes of one pooled profile, each with its vertices in the statue's frame
interface PooledMesh {
  mesh: string;
  points: Vector3[];
}
// A pooled profile fitted by its outermost radius per band (`fitRadialProfile`), its sections each named for the export part
// They came from (`assignSectionParts`) and cut into runs of one part, each run a stack standing at its own foot
const toStatueRuns = (meshes: PooledMesh[], angleCount: number): StatueRun[] => {
  const profile = fitRadialProfile(
    meshes.flatMap(({ points }) => points.map(({ x, y, z }) => [x, y, z] as const)),
    { angleCount, bandHeight: STATUE_BAND_HEIGHT, tolerance: STATUE_RADIUS_TOLERANCE },
  );
  const partPoints = Object.fromEntries(
    meshes.map(({ mesh, points }) => [mesh, points.map(({ x, y, z }) => [x, y, z] as const)]),
  );
  const sectionParts = assignSectionParts(profile.sections, profile, angleCount, partPoints);
  const runs: StatueRun[] = [];
  let height = profile.foot;
  for (const [index, section] of profile.sections.entries()) {
    const part = sectionParts[index] ?? "";
    const rounded = { height: roundFitted(section.height), radii: section.radii.map((radius) => roundFitted(radius)) };
    const run = runs.at(-1);
    if (run?.part === part) run.sections.push(rounded);
    else
      runs.push({
        part,
        position: [roundFitted(profile.axis[0]), roundFitted(height), roundFitted(profile.axis[1])],
        sections: [rounded],
      });
    height += section.height;
  }
  return runs;
};
// The Statue of The Seven as radial profiles in its frame, its root at the origin and unturned, so the Landmark's place and
// Turn set it down. Every statue mesh is taken into that frame by its placement, then pooled into its stone or its figure
// And fitted by its outermost radius per band at each of `angleCount` angles, the outline and the surface the kit lofts
// From. Each band of those profiles is then named for the export mesh it came from, so the surface pass colours each part
// Of the statue its own colour, and the profiles are written as runs of one part each. Writes `windrise/statue.json` and
// Returns the report and its path
export const fitWindriseStatue = async (angleCount: number = STATUE_ANGLE_COUNT): Promise<string[]> => {
  const meshDirectory = join(getComponentDirectory(DerivedAssetComponent.Windrise).assets, AssetType.Mesh);
  // The statue is spawned by its scene point, so its placements are read as the copies the witness lays out
  const placements = await readComponentPlacements(DerivedAssetComponent.Windrise, { isCopied: true });
  await nameMeshPlacements(placements);
  const statuePlacements = placements.filter(({ mesh }) => STATUE_MESH_REGEX.test(mesh));
  const root = statuePlacements.find(({ mesh }) => !STATUE_FIGURE_MESH_REGEX.test(mesh));
  if (!root) throw new InvalidOperationError(Operation.Read, "Statue of The Seven", "has no stone mesh in its layout");
  const toRoot = toMatrix(root).invert();
  const stone: PooledMesh[] = [];
  const figure: PooledMesh[] = [];
  for (const placement of statuePlacements) {
    const transform = toRoot.clone().multiply(toMatrix(placement));
    // oxlint-disable-next-line no-await-in-loop -- one mesh of thousands of vertices is read at a time
    const { vertices } = await readObjMesh(join(meshDirectory, `${placement.mesh}.obj`));
    const points = vertices.map((vertex) => new Vector3(...toRightHanded(vertex)).applyMatrix4(transform));
    (STATUE_FIGURE_MESH_REGEX.test(placement.mesh) ? figure : stone).push({ mesh: placement.mesh, points });
  }
  const runs = [...toStatueRuns(stone, angleCount), ...toStatueRuns(figure, angleCount)];
  const path = await writeWorldData("windrise/statue.json", { parts: runs });
  return [`statue: ${runs.length} parts, ${angleCount} angles`, path];
};
