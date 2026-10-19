import type { GroundPoint } from "genshin-engine";
import type { BufferGeometry, Material } from "three";

import { watchImmediate } from "@vueuse/core";
import { onUnmounted } from "vue";
import { InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";

// Writes one instance of a stand-in mesh at each of its places, each stood on the ground beneath it and lifted by the given
// Height, and disposes the mesh with the component that draws it
export const useStandInInstances = (
  mesh: InstancedMesh<BufferGeometry, Material>,
  places: () => readonly { position: GroundPoint }[],
  getGroundHeight: (x: number, z: number) => number,
  lift: number,
): void => {
  const matrix = new Matrix4();
  const point = new Vector3();
  const rotation = new Quaternion();
  const scale = new Vector3(1, 1, 1);
  watchImmediate(places, (newPlaces) => {
    for (const [index, { position }] of newPlaces.entries()) {
      point.set(position.x, getGroundHeight(position.x, position.z) + lift, position.z);
      mesh.setMatrixAt(index, matrix.compose(point, rotation, scale));
    }
    mesh.count = newPlaces.length;
    mesh.instanceMatrix.needsUpdate = true;
  });
  onUnmounted(() => {
    mesh.geometry.dispose();
    mesh.material.dispose();
    mesh.dispose();
  });
};
