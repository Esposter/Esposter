<script setup lang="ts">
import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { MINING_OUTCROP_STAND_IN_COLOR, MINING_OUTCROP_STAND_IN_RADIUS } from "#src/services/gathering/constants";
import { watchImmediate } from "@vueuse/core";
import { createInstancedMesh, createToonMaterial } from "genshin-engine";
import { DodecahedronGeometry, Matrix4, Quaternion, Vector3 } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which each stand-in floats above
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  // The mining outcrops standing now, each stood in as a rock at its place
  places: readonly GatheringPlace[];
  rampTexture: DataTexture;
}

const { getGroundHeight, lightUniforms, places, rampTexture } = defineProps<Props>();

// Every mining outcrop is one rock of one instanced draw sharing one material. The rocks are placed anywhere in the world,
// So the mesh's bounds, measured from its geometry alone, would cull them. An instanced mesh's count is fixed at setup, so
// The parent mounts this keyed by the number of places, and a change in that number mounts it again
const rockMesh = createInstancedMesh(
  new DodecahedronGeometry(MINING_OUTCROP_STAND_IN_RADIUS),
  createToonMaterial({ color: MINING_OUTCROP_STAND_IN_COLOR, lightUniforms, rampTexture }),
  places.length,
);
rockMesh.frustumCulled = false;
const matrix = new Matrix4();
const point = new Vector3();
const rotation = new Quaternion();
const scale = new Vector3(1, 1, 1);
// The places change as outcrops are mined and drawn again, so the instances are written for the ones standing
watchImmediate(
  () => places,
  (newPlaces) => {
    for (const [index, { position }] of newPlaces.entries()) {
      point.set(position.x, getGroundHeight(position.x, position.z) + MINING_OUTCROP_STAND_IN_RADIUS, position.z);
      rockMesh.setMatrixAt(index, matrix.compose(point, rotation, scale));
    }
    rockMesh.count = newPlaces.length;
    rockMesh.instanceMatrix.needsUpdate = true;
  },
);
onUnmounted(() => {
  rockMesh.geometry.dispose();
  rockMesh.material.dispose();
  rockMesh.dispose();
});
</script>

<template>
  <primitive :object="rockMesh" />
</template>
