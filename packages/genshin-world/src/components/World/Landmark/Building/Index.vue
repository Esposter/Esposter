<script setup lang="ts">
import type { BuildingLandmark } from "#src/models/world/BuildingLandmark";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { BuildingKitPartsMap } from "#src/services/world/BuildingKitPartsMap";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { createToonMaterial } from "genshin-engine";

interface Props {
  landmark: BuildingLandmark;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}

const { landmark, lightUniforms, rampTexture } = defineProps<Props>();
const { building, heightOffset, position, rotation } = landmark;
const groundHeight = getWorldHeight(position.x, position.z);
// The building's region kit decides its parts, each drawn in a material of its own colour
const buildingMeshes = BuildingKitPartsMap[building.kit](building.options as never).map(({ color, geometry }) => ({
  geometry,
  material: createToonMaterial({ color, lightUniforms, rampTexture }),
}));

onUnmounted(() => {
  for (const { geometry, material } of buildingMeshes) {
    geometry.dispose();
    material.dispose();
  }
});
</script>

<template>
  <TresGroup :position="[position.x, groundHeight + heightOffset, position.z]" :rotation-y="rotation">
    <TresMesh
      v-for="({ geometry, material }, index) of buildingMeshes"
      :key="index"
      :geometry
      :material
      cast-shadow
      receive-shadow
    />
  </TresGroup>
</template>
