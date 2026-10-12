import type { Object3D } from "three";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { Matrix4 } from "three";

const fromRest = new Matrix4();
// The game's own door, drawn by the exports in place of ours, rising as ours does: a copy of each piece of its part,
// Sharing its geometry and materials, stands in our piece its bone names, where the part's placement stands it seen from
// Our door at rest, so the lift carrying ours carries it alike. Never culled, as ours are not. Returns the copies
export const rideLoginWitnessDoor = (
  part: Object3D,
  doorPieces: readonly Object3D[],
  doorRest: Matrix4,
): Object3D[] => {
  part.updateMatrix();
  fromRest.copy(doorRest).invert().multiply(part.matrix);
  return part.children.map((piece) => {
    const doorPiece = doorPieces[Number(piece.name)];
    if (!doorPiece)
      throw new InvalidOperationError(Operation.Read, `${part.name} piece ${piece.name}`, "rides no piece of ours");
    const copy = piece.clone();
    copy.applyMatrix4(fromRest);
    copy.traverse((object) => {
      object.frustumCulled = false;
    });
    doorPiece.add(copy);
    return copy;
  });
};
