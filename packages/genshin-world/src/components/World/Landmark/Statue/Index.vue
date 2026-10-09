<script setup lang="ts">
import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import statue from "#src/data/windrise/statue.json";
import { getStatuePartColor } from "#src/services/windrise/constants";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { createStatueGeometries, createToonMaterial } from "genshin-engine";

interface Props {
  landmark: StatueLandmark;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}

const { landmark, lightUniforms, rampTexture } = defineProps<Props>();
const { heightOffset, position, rotation } = landmark;
const groundHeight = getWorldHeight(position.x, position.z);
// Each part of the statue is drawn in its own colour, as its export mesh's textures paint it
const statueParts = Object.entries(createStatueGeometries(statue.parts)).map(([part, geometry]) => ({
  geometry,
  material: createToonMaterial({ color: getStatuePartColor(part), lightUniforms, rampTexture }),
}));

onUnmounted(() => {
  for (const { geometry, material } of statueParts) {
    geometry.dispose();
    material.dispose();
  }
});
</script>

<template>
  <TresMesh
    v-for="({ geometry, material }, index) in statueParts"
    :key="index"
    :geometry
    :material
    :position="[position.x, groundHeight + heightOffset, position.z]"
    :rotation-y="rotation"
    cast-shadow
    receive-shadow
  />
</template>
