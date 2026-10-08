import type { BufferGeometry } from "three";

import { InstancedMesh, MeshBasicMaterial } from "three";

// A stand-in of an instanced mesh for the sight's mask: the same geometry and the same instance matrices, drawn in one
// Basic material whose instance colours are the colours the sight lights each thing in. The world's own materials do not
// Change for the sight, and the stand-in is counted up to what the source draws
export const createSightProxy = (source: InstancedMesh): InstancedMesh<BufferGeometry, MeshBasicMaterial> => {
  const proxy = new InstancedMesh(source.geometry, new MeshBasicMaterial(), source.instanceMatrix.count);
  proxy.instanceMatrix = source.instanceMatrix;
  proxy.count = 0;
  proxy.frustumCulled = false;
  return proxy;
};
