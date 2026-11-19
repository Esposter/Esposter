import type { GroundPoint } from "genshin-engine";
import type { BufferGeometry, Material, Mesh } from "three";
import type { MaybeRefOrGetter } from "vue";

import { useDisposedMesh } from "#src/composables/useDisposedMesh";
import { watchImmediate } from "@vueuse/core";
import { toValue } from "vue";

// A mesh standing on the water at the lure, following the lure as it moves and the ground under it, disposed with the
// Component that draws it
export const useLureMesh = (
  geometry: BufferGeometry,
  material: Material,
  lure: MaybeRefOrGetter<GroundPoint>,
  getGroundHeight: (x: number, z: number) => number,
): Mesh<BufferGeometry, Material> => {
  const mesh = useDisposedMesh(geometry, material);
  watchImmediate(
    [() => toValue(lure).x, () => toValue(lure).z, () => getGroundHeight(toValue(lure).x, toValue(lure).z)],
    ([x, z, height]) => {
      mesh.position.set(x, height, z);
    },
  );
  return mesh;
};
