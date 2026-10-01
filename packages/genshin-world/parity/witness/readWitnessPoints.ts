import type { SceneWitness } from "#src/models/scene/SceneWitness";
import type { Object3D } from "three";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { Box3, Vector3 } from "three";

// Each landmark's place in the world as the witness draws it, in three's axes: a share of its part's bounding box
// Along each axis (0 its least corner, 1 its greatest), the part named by its mesh: the placement of it standing nearest
// The point given, or the first drawn
export const readWitnessPoints = (
  { parts }: SceneWitness,
  landmarks: readonly { mesh: string; near?: [number, number, number]; share: [number, number, number] }[],
): [number, number, number][] => {
  parts.updateWorldMatrix(true, true);
  return landmarks.map(({ mesh, near, share }) => {
    const candidates: Object3D[] = [];
    parts.traverse((object) => {
      if (object.name === mesh) candidates.push(object);
    });
    const nearPoint = near ? new Vector3(...near) : undefined;
    const part = nearPoint
      ? candidates.toSorted(
          (first, second) =>
            first.getWorldPosition(new Vector3()).distanceTo(nearPoint) -
            second.getWorldPosition(new Vector3()).distanceTo(nearPoint),
        )[0]
      : candidates[0];
    if (!part) throw new InvalidOperationError(Operation.Read, mesh, "not a part the witness draws");
    const { max, min } = new Box3().setFromObject(part);
    return new Vector3(...share).multiply(max.clone().sub(min)).add(min).toArray();
  });
};
