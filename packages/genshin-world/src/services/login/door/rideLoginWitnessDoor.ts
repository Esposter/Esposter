import type { Object3D } from "three";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { Matrix4 } from "three";

// The game's own door, drawn by the exports in place of ours, rising as ours does: a copy of each piece of its part,
// Sharing its geometry and materials, stands in our piece its bone names. Each copy holds its placement within the
// Family, which followLoginWitnessDoor carries to our door's axes every frame, so the lift carrying ours carries it
// Alike. Like ours, never culled and casting no shadow. Returns the copies
export const rideLoginWitnessDoor = (family: Object3D, doorPieces: readonly Object3D[]): Object3D[] =>
  family.children.flatMap((part) => {
    part.updateMatrix();
    return part.children.map((piece) => {
      const doorPiece = doorPieces[Number(piece.name)];
      if (!doorPiece)
        throw new InvalidOperationError(Operation.Read, `${part.name} piece ${piece.name}`, "rides no piece of ours");
      piece.updateMatrix();
      const copy = piece.clone();
      copy.userData.inFamily = new Matrix4().multiplyMatrices(part.matrix, piece.matrix);
      copy.traverse((object) => {
        object.castShadow = false;
        object.frustumCulled = false;
      });
      doorPiece.add(copy);
      return copy;
    });
  });
