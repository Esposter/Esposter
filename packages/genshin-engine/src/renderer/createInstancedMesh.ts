import type { BufferGeometry, Material } from "three";

import { InstancedMesh } from "three";
import { StorageInstancedBufferAttribute } from "three/webgpu";

// An instanced mesh whose matrices the GPU reads from a storage buffer, uploaded only when they change. Three reads the
// Matrices of a mesh of a uniform buffer's worth or fewer from a uniform buffer it writes again on every draw, the
// Previous frame's beside them, so a mesh standing still wrote the same bytes in every pass of every frame
export const createInstancedMesh = <TGeometry extends BufferGeometry, TMaterial extends Material | Material[]>(
  geometry: TGeometry,
  material: TMaterial,
  count: number,
): InstancedMesh<TGeometry, TMaterial> => {
  const mesh = new InstancedMesh(geometry, material, count);
  mesh.instanceMatrix = new StorageInstancedBufferAttribute(mesh.instanceMatrix.array, mesh.instanceMatrix.itemSize);
  return mesh;
};
