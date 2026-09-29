<script setup lang="ts">
import type { TreeLandmark } from "@/models/genshin/world/TreeLandmark";
import type { LightUniforms, WindUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { BARK_COLOR, LEAF_COLOR } from "@/services/genshin/windrise/constants";
import { getWindriseHeight } from "@/services/genshin/windrise/getWindriseHeight";
import { createLeafMaterial, createToonMaterial, createTreeGeometry } from "genshin-engine";

interface Props {
  landmark: TreeLandmark;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
  windUniforms: WindUniforms;
}

const { landmark, lightUniforms, rampTexture, windUniforms } = defineProps<Props>();
const { heightOffset, position, rotation, treeOptions } = landmark;
const groundHeight = getWindriseHeight(position.x, position.z);
const { branchGeometry, leafGeometry } = createTreeGeometry(treeOptions);
const barkMaterial = createToonMaterial({ color: BARK_COLOR, lightUniforms, rampTexture });
const leafMaterial = createLeafMaterial({ color: LEAF_COLOR, lightUniforms, rampTexture }, windUniforms);

onUnmounted(() => {
  branchGeometry.dispose();
  leafGeometry.dispose();
  barkMaterial.dispose();
  leafMaterial.dispose();
});
</script>

<template>
  <TresGroup :position="[position.x, groundHeight + heightOffset, position.z]" :rotation-y="rotation">
    <TresMesh :geometry="branchGeometry" :material="barkMaterial" cast-shadow receive-shadow />
    <TresMesh :geometry="leafGeometry" :material="leafMaterial" cast-shadow receive-shadow />
  </TresGroup>
</template>
