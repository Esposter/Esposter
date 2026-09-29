<script setup lang="ts">
import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { STONE_COLOR } from "#src/services/windrise/constants";
import { getWindriseHeight } from "#src/services/windrise/getWindriseHeight";
import { createStatueGeometry, createToonMaterial } from "genshin-engine";

interface Props {
  landmark: StatueLandmark;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}

const { landmark, lightUniforms, rampTexture } = defineProps<Props>();
const { heightOffset, position, rotation } = landmark;
const groundHeight = getWindriseHeight(position.x, position.z);
const statueGeometry = createStatueGeometry();
const stoneMaterial = createToonMaterial({ color: STONE_COLOR, lightUniforms, rampTexture });

onUnmounted(() => {
  statueGeometry.dispose();
  stoneMaterial.dispose();
});
</script>

<template>
  <TresMesh
    :geometry="statueGeometry"
    :material="stoneMaterial"
    :position="[position.x, groundHeight + heightOffset, position.z]"
    :rotation-y="rotation"
    cast-shadow
    receive-shadow
  />
</template>
