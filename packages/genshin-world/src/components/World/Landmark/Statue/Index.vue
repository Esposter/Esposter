<script setup lang="ts">
import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { ToonNodeMaterial } from "genshin-engine";

import statue from "#src/data/windrise/statue.json";
import { getStatuePartColor, getStatuePartDetail } from "#src/services/windrise/constants";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { createStatueGeometries, setObjectSurface } from "genshin-engine";
import { Mesh } from "three";

interface Props {
  landmark: StatueLandmark;
  // The one material every landmark's part draws in, each in the surface its mesh carries
  partMaterial: ToonNodeMaterial;
}

const { landmark, partMaterial } = defineProps<Props>();
const { heightOffset, position, rotation } = landmark;
const groundHeight = getWorldHeight(position.x, position.z);
// Each part of the statue is drawn in its own colour and detail, as its export mesh's textures paint it
const statueMeshes = Object.entries(createStatueGeometries(statue.parts)).map(([part, geometry]) => {
  const mesh = new Mesh(geometry, partMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  setObjectSurface(mesh, getStatuePartColor(part), getStatuePartDetail(part));
  return mesh;
});

onUnmounted(() => {
  for (const { geometry } of statueMeshes) geometry.dispose();
});
</script>

<template>
  <TresGroup :position="[position.x, groundHeight + heightOffset, position.z]" :rotation-y="rotation">
    <primitive v-for="(mesh, index) of statueMeshes" :key="index" :object="mesh" />
  </TresGroup>
</template>
