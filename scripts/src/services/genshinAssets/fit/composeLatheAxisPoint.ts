import type { LatheProfile } from "#src/models/genshinAssets/fit/LatheProfile";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { Vector } from "#src/models/shared/Vector";

import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { Quaternion, Vector3 } from "three";

// A point on a lathe's axis, this high above its foot in its mesh's units, where a placement stands it in the world,
// In three's axes
export const composeLatheAxisPoint = (
  { axis: [axisX, axisZ], foot }: LatheProfile,
  { position, rotation, scale }: Pick<AssetPlacement, "position" | "rotation" | "scale">,
  height: number,
): Vector =>
  toRightHanded(
    new Vector3(axisX, foot + height, axisZ)
      .multiply(new Vector3(...scale))
      .applyQuaternion(new Quaternion(...rotation))
      .add(new Vector3(...position))
      .toArray(),
  );
