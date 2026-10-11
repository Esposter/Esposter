import type { InstancedMesh } from "three";

import { Matrix4, Quaternion, Vector3 } from "three";

// A writer of one upright capsule's matrix at an index of an instanced mesh, stood on the ground under its position and
// turned to its heading. Its scratch objects are kept by the writer, so each write allocates nothing. It returns the point
// the capsule stands at, its centre, for a caller that places something else on it
export const createCapsuleMatrixWriter = () => {
  const matrix = new Matrix4();
  const point = new Vector3();
  const rotation = new Quaternion();
  const scale = new Vector3(1, 1, 1);
  const up = new Vector3(0, 1, 0);
  return (
    mesh: InstancedMesh,
    index: number,
    {
      groundHeight,
      heading,
      height,
      x,
      z,
    }: { groundHeight: number; heading: number; height: number; x: number; z: number },
  ): Vector3 => {
    point.set(x, groundHeight + height / 2, z);
    mesh.setMatrixAt(index, matrix.compose(point, rotation.setFromAxisAngle(up, heading), scale));
    return point;
  };
};
