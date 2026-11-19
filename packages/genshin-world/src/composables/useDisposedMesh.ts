import type { BufferGeometry, Material } from "three";

import { Mesh } from "three";
import { onUnmounted } from "vue";

// A mesh over the geometry and material it is given, and both are disposed with the component that draws it
export const useDisposedMesh = (geometry: BufferGeometry, material: Material): Mesh<BufferGeometry, Material> => {
  onUnmounted(() => {
    geometry.dispose();
    material.dispose();
  });
  return new Mesh(geometry, material);
};
