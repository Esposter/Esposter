import type { LatheProfile } from "#src/models/genshinAssets/fit/LatheProfile";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitLatheProfile } from "#src/services/genshinAssets/fit/fitLatheProfile";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import {
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
// The Statue of The Seven as two lathes, its stone (every level of the stand it is drawn on) and its figure, each a
// Stack of sections standing at its own axis in the statue's frame: its root at the origin, unturned, so the landmark's
// Place and turn set it down. Every statue mesh is taken into that frame by its placement, then pooled into its part
// And fitted as a lathe by its outermost radius per band (`fitLatheProfile`), the outline a lathe is read off. Writes
// `windrise/statue.json` and returns the report and its path
export const fitWindriseStatue = async (): Promise<string[]> => {
  const meshDirectory = join(getComponentDirectory(DerivedAssetComponent.Windrise).assets, AssetType.Mesh);
  // The statue is spawned by its scene point, so its placements are read as the copies the witness lays out
  const placements = await readComponentPlacements(DerivedAssetComponent.Windrise, { isCopied: true });
  await nameMeshPlacements(placements);
  const statuePlacements = placements.filter(({ mesh }) => STATUE_MESH_REGEX.test(mesh));
  const root = statuePlacements.find(({ mesh }) => !STATUE_FIGURE_MESH_REGEX.test(mesh));
  if (!root) throw new InvalidOperationError(Operation.Read, "Statue of The Seven", "has no stone mesh in its layout");
  const toRoot = toMatrix(root).invert();
  const stone: Vector3[] = [];
  const figure: Vector3[] = [];
  for (const placement of statuePlacements) {
    const transform = toRoot.clone().multiply(toMatrix(placement));
    // oxlint-disable-next-line no-await-in-loop -- one mesh of thousands of vertices is read at a time
    const { vertices } = await readObjMesh(join(meshDirectory, `${placement.mesh}.obj`));
    const points = vertices.map((vertex) => new Vector3(...toRightHanded(vertex)).applyMatrix4(transform));
    const pool = STATUE_FIGURE_MESH_REGEX.test(placement.mesh) ? figure : stone;
    pool.push(...points);
  }
  const toPart = (points: Vector3[]): { position: number[]; sections: LatheProfile["sections"] } => {
    const profile = fitLatheProfile(
      points.map(({ x, y, z }) => [x, y, z] as const),
      { bandHeight: STATUE_BAND_HEIGHT, tolerance: STATUE_RADIUS_TOLERANCE },
    );
    return {
      position: [roundFitted(profile.axis[0]), roundFitted(profile.foot), roundFitted(profile.axis[1])],
      sections: profile.sections.map(({ bottomRadius, height, topRadius }) => ({
        bottomRadius: roundFitted(bottomRadius),
        height: roundFitted(height),
        topRadius: roundFitted(topRadius),
      })),
    };
  };
  const parts = [toPart(stone), toPart(figure)];
  const path = await writeWorldData("windrise/statue.json", { parts });
  return [
    `statue: stone ${parts[0]?.sections.length ?? 0} sections, figure ${parts[1]?.sections.length ?? 0} sections`,
    path,
  ];
};
