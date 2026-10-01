import type { SceneContext } from "#src/models/scene/SceneContext";
import type { SceneWitness } from "#src/models/scene/SceneWitness";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { Box3, Vector3 } from "three";

// Each part a family of the witness draws, as the camera sees it: its mesh, where it stands in the world (three's
// Axes), and where the middle of its bounding box's top lands on the screen, from 0 to 1 across and down, behind the
// Camera left out. A reference's landmarks are matched to parts by these, one instance of a mesh standing many times
export const readWitnessParts = (
  { parts }: SceneWitness,
  context: SceneContext | undefined,
  family: string,
): { mesh: string; position: [number, number, number]; screen: [number, number] }[] => {
  if (!context) throw new InvalidOperationError(Operation.Read, "witness", "the scene has not rendered yet");
  const { camera } = context;
  const familyGroup = parts.children.find(({ name }) => name === family);
  if (!familyGroup) throw new InvalidOperationError(Operation.Read, family, "not a family the witness draws");
  parts.updateWorldMatrix(true, true);
  camera.updateMatrixWorld();
  return familyGroup.children.flatMap((part) => {
    const { max, min } = new Box3().setFromObject(part);
    const top = new Vector3((min.x + max.x) / 2, max.y, (min.z + max.z) / 2);
    const projected = top.clone().project(camera);
    if (projected.z > 1 || projected.z < -1) return [];
    return [
      {
        mesh: part.name,
        position: part.getWorldPosition(new Vector3()).toArray(),
        screen: [(projected.x + 1) / 2, (1 - projected.y) / 2] as [number, number],
      },
    ];
  });
};
