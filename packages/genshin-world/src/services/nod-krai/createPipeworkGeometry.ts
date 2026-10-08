import type { PipeRun } from "#src/models/nod-krai/PipeRun";
import type { BufferGeometry } from "three";

import { mergeGeometryParts } from "genshin-engine";
import { CylinderGeometry, Quaternion, Vector3 } from "three";

const PIPE_RADIAL_SEGMENTS = 8;
const UP = new Vector3(0, 1, 0);
// Pipework as one cylinder of the given radius between each run's two ends, every cylinder standing on its run, merged
// Into one geometry
export const createPipeworkGeometry = (runs: PipeRun[], radius: number): BufferGeometry => {
  const direction = new Vector3();
  const middle = new Vector3();
  const rotation = new Quaternion();
  const parts = runs.map(({ from, to }) => {
    direction.subVectors(to, from);
    middle.addVectors(from, to).multiplyScalar(0.5);
    const part = new CylinderGeometry(radius, radius, direction.length(), PIPE_RADIAL_SEGMENTS);
    part.applyQuaternion(rotation.setFromUnitVectors(UP, direction.normalize()));
    return part.translate(middle.x, middle.y, middle.z);
  });
  return mergeGeometryParts(parts);
};
