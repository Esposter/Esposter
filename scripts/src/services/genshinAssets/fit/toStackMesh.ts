import type { Vector } from "#src/models/shared/Vector";
import type { StatueStack } from "genshin-engine";

import { computeStatueSurface } from "genshin-engine";
import { Quaternion, Vector3 } from "three";

// A candidate's stacks drawn as the kit draws them, their surface's triangles in the statue's frame
export const toStackMesh = (stacks: readonly StatueStack[]): { faces: Vector[]; vertices: Vector[] } => {
  const faces: Vector[] = [];
  const vertices: Vector[] = [];
  const vertex = new Vector3();
  for (const { position, rotation, sections } of stacks) {
    const { indices, positions } = computeStatueSurface(sections);
    const turn = new Quaternion(...rotation);
    const foot = new Vector3(...position);
    const offset = vertices.length;
    for (let index = 0; index < positions.length; index += 3)
      vertices.push(
        vertex
          .set(positions[index] ?? 0, positions[index + 1] ?? 0, positions[index + 2] ?? 0)
          .applyQuaternion(turn)
          .add(foot)
          .toArray(),
      );
    for (let index = 0; index < indices.length; index += 3)
      faces.push([
        offset + (indices[index] ?? 0),
        offset + (indices[index + 1] ?? 0),
        offset + (indices[index + 2] ?? 0),
      ]);
  }
  return { faces, vertices };
};
