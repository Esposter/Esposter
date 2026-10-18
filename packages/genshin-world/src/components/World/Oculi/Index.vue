<script setup lang="ts">
import type { OculusPlace } from "#src/models/oculus/OculusPlace";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { OCULUS_STAND_IN_COLOR, OCULUS_STAND_IN_RADIUS } from "#src/services/statue/constants";
import { watchImmediate } from "@vueuse/core";
import { createInstancedMesh, createToonMaterial } from "genshin-engine";
import { Matrix4, Quaternion, SphereGeometry, Vector3 } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which each stand-in floats above
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  // The Oculi not yet found, each stood in at its place
  places: readonly OculusPlace[];
  rampTexture: DataTexture;
}

const { getGroundHeight, lightUniforms, places, rampTexture } = defineProps<Props>();

// Every Oculus is one sphere of one instanced draw sharing one material. The stand-ins are placed anywhere in the world,
// So the mesh's bounds, measured from its geometry alone, would cull them. The places are read after the world starts, so
// The parent mounts this once they are in, as an instanced mesh's count is fixed at setup
const oculusMesh = createInstancedMesh(
  new SphereGeometry(OCULUS_STAND_IN_RADIUS),
  createToonMaterial({ color: OCULUS_STAND_IN_COLOR, lightUniforms, rampTexture }),
  places.length,
);
oculusMesh.frustumCulled = false;
const matrix = new Matrix4();
const point = new Vector3();
const rotation = new Quaternion();
const scale = new Vector3(1, 1, 1);
// The places change as Oculi are found, so the instances are written again for the ones still unfound
watchImmediate(
  () => places,
  (newPlaces) => {
    for (const [index, { position }] of newPlaces.entries()) {
      point.set(position.x, getGroundHeight(position.x, position.z) + OCULUS_STAND_IN_RADIUS, position.z);
      oculusMesh.setMatrixAt(index, matrix.compose(point, rotation, scale));
    }
    oculusMesh.count = newPlaces.length;
    oculusMesh.instanceMatrix.needsUpdate = true;
  },
);
onUnmounted(() => {
  oculusMesh.geometry.dispose();
  oculusMesh.material.dispose();
  oculusMesh.dispose();
});
</script>

<template>
  <primitive :object="oculusMesh" />
</template>
