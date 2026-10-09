import type { SceneWitness } from "#src/models/scene/SceneWitness";

import { computeLeafHalfGeometry } from "#parity/witness/computeLeafHalfGeometry";
import { Mesh } from "three";

// The leaf cards each part of the witness draws: all of them unless a half is asked for, then only that half's, the
// Full geometry kept on the mesh so a view without a half draws it again. A leaf is one its material's shader marks
export const applyLeafHalf = ({ parts }: Pick<SceneWitness, "parts">, leafHalf: 0 | 1 | undefined): void => {
  parts.traverse((object) => {
    if (!(object instanceof Mesh) || object.material.userData.isLeafCard !== true) return;
    object.userData.fullGeometry ??= object.geometry;
    object.geometry =
      leafHalf === undefined
        ? object.userData.fullGeometry
        : computeLeafHalfGeometry(object.userData.fullGeometry, leafHalf);
  });
};
