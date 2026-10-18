import type { BufferGeometry } from "three";

import { InstancedBufferGeometry } from "three";

// A geometry drawn once for each of its instances, sharing the attributes and index of the one it copies. Its count is
// Every instance a draw takes when no culling pass has run to choose them, as on WebGL
export const createInstancedGeometry = (geometry: BufferGeometry, instanceCount: number): InstancedBufferGeometry => {
  const instancedGeometry = new InstancedBufferGeometry();
  for (const [name, attribute] of Object.entries(geometry.attributes)) instancedGeometry.setAttribute(name, attribute);
  instancedGeometry.setIndex(geometry.getIndex());
  instancedGeometry.instanceCount = instanceCount;
  return instancedGeometry;
};
