import type { SceneWitness } from "#src/models/scene/SceneWitness";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { Box3, Vector3 } from "three";

// Each landmark's place in the world as the witness draws it, in three's axes: a share of its part's bounding box
// Along each axis (0 its least corner, 1 its greatest), the part named by its mesh, the first placement of it drawn
export const readWitnessPoints = (
  { parts }: SceneWitness,
  landmarks: readonly { mesh: string; share: [number, number, number] }[],
): [number, number, number][] => {
  parts.updateWorldMatrix(true, true);
  return landmarks.map(({ mesh, share }) => {
    const part = parts.getObjectByName(mesh);
    if (!part) throw new InvalidOperationError(Operation.Read, mesh, "not a part the witness draws");
    const { max, min } = new Box3().setFromObject(part);
    return new Vector3(...share).multiply(max.clone().sub(min)).add(min).toArray();
  });
};
