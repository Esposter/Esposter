import type { SceneContext } from "#src/models/scene/SceneContext";
import type { Object3D } from "three";

import { SCENE_FAMILY_KEY } from "#src/services/scene/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The pieces a family's part carries, each placed within the part as the scene last set it, as its matrix's elements
// Column by column, which the motion pass holds against the clip that moves them
export const getScenePieces = (context: SceneContext | undefined, family: string): number[][] => {
  const parts: Object3D[] = [];
  context?.scene.traverse((object) => {
    if (object.userData[SCENE_FAMILY_KEY] === family && object.children.length > 0) parts.push(object);
  });
  const [part] = parts;
  if (!part) throw new InvalidOperationError(Operation.Read, family, "no part of the scene carries its pieces");
  return part.children.map((piece) => {
    piece.updateMatrix();
    return piece.matrix.toArray();
  });
};
