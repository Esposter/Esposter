import type { PavingStone } from "#src/models/kits/architecture/PavingStone";
import type { BufferGeometry } from "three";

import { createPavingStoneGeometry } from "#src/kits/architecture/createPavingStoneGeometry";
import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";
import { Matrix4, Quaternion, Vector3 } from "three";

// Paving stones each drawn where its transform stands, merged into one geometry for one material and one draw
export const createPavingGeometry = (stones: readonly PavingStone[]): BufferGeometry =>
  mergeGeometryParts(
    stones.map(({ position, quaternion, scale, shape }) =>
      createPavingStoneGeometry(shape).applyMatrix4(
        new Matrix4().compose(
          new Vector3().fromArray(position),
          new Quaternion().fromArray(quaternion),
          new Vector3().fromArray(scale),
        ),
      ),
    ),
  );
