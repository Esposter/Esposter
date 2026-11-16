import type { HullPlacement } from "#src/models/genshinAssets/fit/HullPlacement";
import type { SceneLayout } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { roundRotation } from "#src/services/genshinAssets/fit/roundRotation";
import { SCALE_DECIMALS } from "#src/services/genshinAssets/shared/constants";

// The witness placements whose mesh the check keeps, each the hull of that mesh placed where the witness draws it: the
// Layout is already in three's axes round the origin, so nothing is turned or moved again
export const toHullPlacements = (
  placements: SceneLayout["placements"],
  checkIsHullMesh: (mesh: string) => boolean,
): HullPlacement[] =>
  placements
    .filter(({ mesh }) => checkIsHullMesh(mesh))
    .map(({ mesh, position, rotation, scale }) => {
      const [x = 0, y = 0, z = 0] = position.map((value) => roundFitted(value));
      return {
        hull: mesh,
        position: [x, y, z],
        rotation: rotation.map((value) => roundRotation(value)),
        scale: scale.map((value) => roundFitted(value, SCALE_DECIMALS)),
      };
    });
