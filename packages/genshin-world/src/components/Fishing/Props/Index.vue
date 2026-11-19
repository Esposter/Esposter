<script setup lang="ts">
import type { FishingPropPlace } from "#src/models/fishing/FishingPropPlace";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { createFishingPropGroup } from "#src/services/fishingProps/createFishingPropGroup";
import { createToonMaterial } from "genshin-engine";

interface Props {
  lightUniforms: LightUniforms;
  // The region's fishing-area props, each drawn as a stand-in at the place, turn and scale its record gives it
  places: FishingPropPlace[];
  rampTexture: DataTexture;
}

const { lightUniforms, places, rampTexture } = defineProps<Props>();
// One material for every stand-in, and one geometry per prop name, each made once for the region the parent mounts this
// For, and disposed with the component that holds them
const partMaterial = createToonMaterial({ isObjectSurface: true, lightUniforms, rampTexture });
const { geometries, group: propsGroup } = createFishingPropGroup(places, partMaterial);

onUnmounted(() => {
  for (const geometry of geometries) geometry.dispose();
  partMaterial.dispose();
});
</script>

<template>
  <primitive :object="propsGroup" />
</template>
