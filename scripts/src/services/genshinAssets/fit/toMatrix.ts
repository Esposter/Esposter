import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { toRightHandedRotation } from "#src/services/genshinAssets/shared/toRightHandedRotation";
import { Matrix4, Quaternion, Vector3 } from "three";

// A placement's transform in three's axes
export const toMatrix = ({
  position,
  rotation,
  scale,
}: Pick<AssetPlacement, "position" | "rotation" | "scale">): Matrix4 =>
  new Matrix4().compose(
    new Vector3(...toRightHanded(position)),
    new Quaternion(...toRightHandedRotation(rotation)),
    new Vector3(...scale),
  );
