<script setup lang="ts">
import type { RegionData } from "#src/models/world/RegionData";
import type { LightUniforms, WindUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import WorldLandmarkStatue from "#src/components/World/Landmark/Statue/Index.vue";
import WorldLandmarkTree from "#src/components/World/Landmark/Tree/Index.vue";
import { LandmarkKind } from "#src/models/world/LandmarkKind";

interface Props {
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
  regionDataMap: ReadonlyMap<string, RegionData>;
  windUniforms: WindUniforms;
}

const { lightUniforms, rampTexture, regionDataMap, windUniforms } = defineProps<Props>();
// Every landmark of every region in reach, built by its kind's kit, so a region's landmarks appear as its data
// Arrives and go when it is released
const regionLandmarks = computed(() => [...regionDataMap.values()].flatMap(({ landmarks }) => landmarks));
</script>

<template>
  <template v-for="landmark of regionLandmarks" :key="landmark.id">
    <WorldLandmarkTree
      v-if="landmark.kind === LandmarkKind.Tree"
      :landmark
      :light-uniforms
      :ramp-texture
      :wind-uniforms
    />
    <WorldLandmarkStatue v-else :landmark :light-uniforms :ramp-texture />
  </template>
</template>
