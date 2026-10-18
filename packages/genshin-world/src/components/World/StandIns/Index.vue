<script setup lang="ts">
import type { GroundPoint, LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { StandInShape } from "#src/models/world/StandInShape";
import { watchImmediate } from "@vueuse/core";
import { createInstancedMesh, createToonMaterial } from "genshin-engine";
import { DodecahedronGeometry, Matrix4, Quaternion, SphereGeometry, Vector3 } from "three";

interface Props {
  // The stand-in's colour
  color: number;
  // The world's ground at a point in its own coordinates, which each stand-in floats above
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  // The places each stand-in is set at, one instance each
  places: readonly { position: GroundPoint }[];
  // The radius in metres of each stand-in
  radius: number;
  rampTexture: DataTexture;
  // The shape each stand-in is drawn as
  shape: StandInShape;
}

const { color, getGroundHeight, lightUniforms, places, radius, rampTexture, shape } = defineProps<Props>();

// Every stand-in is one shape of one instanced draw sharing one material. The stand-ins are placed anywhere in the world,
// so the mesh's bounds, measured from its geometry alone, would cull them. An instanced mesh's count is fixed at setup, so
// the parent mounts this keyed by the number of places, and a change in that number mounts it again
const standInMesh = createInstancedMesh(
  shape === StandInShape.Rock ? new DodecahedronGeometry(radius) : new SphereGeometry(radius),
  createToonMaterial({ color, lightUniforms, rampTexture }),
  places.length,
);
standInMesh.frustumCulled = false;
const matrix = new Matrix4();
const point = new Vector3();
const rotation = new Quaternion();
const scale = new Vector3(1, 1, 1);
// The places change as the stand-ins are found, mined or drawn again, so the instances are written for the ones standing
watchImmediate(
  () => places,
  (newPlaces) => {
    for (const [index, { position }] of newPlaces.entries()) {
      point.set(position.x, getGroundHeight(position.x, position.z) + radius, position.z);
      standInMesh.setMatrixAt(index, matrix.compose(point, rotation, scale));
    }
    standInMesh.count = newPlaces.length;
    standInMesh.instanceMatrix.needsUpdate = true;
  },
);
onUnmounted(() => {
  standInMesh.geometry.dispose();
  standInMesh.material.dispose();
  standInMesh.dispose();
});
</script>

<template>
  <primitive :object="standInMesh" />
</template>
