<script setup lang="ts">
import type { MaterialSourcePlace } from "#src/models/wildlife/MaterialSourcePlace";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { WILDLIFE_CAPACITY, WILDLIFE_COLOR } from "#src/services/wildlife/constants";
import { getCritterStandInPlaces } from "#src/services/wildlife/getCritterStandInPlaces";
import { composeHeadingMatrix } from "#src/services/world/composeHeadingMatrix";
import { useLoop } from "@tresjs/core";
import { createCritterGeometry, createInstancedMesh, createToonMaterial } from "genshin-engine";
import { Matrix4, Vector3 } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which each stand-in stands on
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  // The material sources in the world, the critters picked up whole, a picked one left out by the session
  materialSources: readonly MaterialSourcePlace[];
  rampTexture: DataTexture;
}

const { getGroundHeight, lightUniforms, materialSources, rampTexture } = defineProps<Props>();
const { onBeforeRender } = useLoop();
// Every critter point is one stand-in of one instanced draw, stood on the ground until its species is fitted. The
// Points are filtered when the material sources change, not each frame, and the critters stand still
const standInPlaces = computed(() => getCritterStandInPlaces(materialSources));
const critterMaterial = createToonMaterial({ color: WILDLIFE_COLOR, lightUniforms, rampTexture });
const critterMesh = createInstancedMesh(createCritterGeometry(), critterMaterial, WILDLIFE_CAPACITY);
critterMesh.frustumCulled = false;
const matrix = new Matrix4();
const point = new Vector3();

onBeforeRender(() => {
  let count = 0;
  for (const { position } of standInPlaces.value) {
    if (count === WILDLIFE_CAPACITY) break;
    point.set(position.x, getGroundHeight(position.x, position.z), position.z);
    critterMesh.setMatrixAt(count, composeHeadingMatrix(matrix, point, 0));
    count += 1;
  }

  critterMesh.count = count;
  critterMesh.instanceMatrix.needsUpdate = true;
});

onUnmounted(() => {
  critterMesh.geometry.dispose();
  critterMaterial.dispose();
  critterMesh.dispose();
});
</script>

<template>
  <primitive :object="critterMesh" />
</template>
