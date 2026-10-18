import type { Object3D } from "three";

import { Matrix4 } from "three";

const inverseRest = new Matrix4();
const toFamily = new Matrix4();
const local = new Matrix4();
// Places each copy the family rode at the family's current offset, in our door's axes: the copy's placement within its
// Family, carried by the family's matrix and taken back through our door at rest. Called each frame, so a copy follows
// The offset its family group is set to, as the walkway's and the towers' copies do
export const followLoginWitnessDoor = (family: Object3D, doorPieces: readonly Object3D[], doorRest: Matrix4): void => {
  family.updateMatrix();
  inverseRest.copy(doorRest).invert();
  toFamily.multiplyMatrices(inverseRest, family.matrix);
  for (const doorPiece of doorPieces)
    for (const copy of doorPiece.children) {
      const inFamily = copy.userData.inFamily as Matrix4 | undefined;
      if (!inFamily) continue;
      local.multiplyMatrices(toFamily, inFamily).decompose(copy.position, copy.quaternion, copy.scale);
    }
};
