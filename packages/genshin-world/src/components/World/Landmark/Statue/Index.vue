<script setup lang="ts">
import type { WindriseStatue } from "#src/models/windrise/WindriseStatue";
import type { WindriseSurfaces } from "#src/models/windrise/WindriseSurfaces";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { ToonNodeMaterial } from "genshin-engine";

import { getWindrisePartDetail } from "#src/services/windrise/getWindrisePartDetail";
import { createStatueGeometries, setObjectSurface } from "genshin-engine";
import { Mesh } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which the statue stands on
  getGroundHeight: (x: number, z: number) => number;
  landmark: StatueLandmark;
  // The one material every landmark's part draws in, each in the surface its mesh carries
  partMaterial: ToonNodeMaterial;
  // The statue's parts and the sections of their shafts
  statue: WindriseStatue;
  // The families' surfaces, the statue's giving each of its parts its detail
  surfaces: WindriseSurfaces;
}

const { getGroundHeight, landmark, partMaterial, statue, surfaces } = defineProps<Props>();
const { heightOffset, position, rotation } = landmark;
const groundHeight = getGroundHeight(position.x, position.z);
// Each part of the statue is drawn in the colours its stacks carry, read off its export mesh's textures where each of
// Their vertices stands, unscaled, and in its own detail
const statueMeshes = Object.entries(createStatueGeometries(statue.parts)).map(([part, geometry]) => {
  const mesh = new Mesh(geometry, partMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  setObjectSurface(mesh, 0xffffff, getWindrisePartDetail(surfaces.Statue, part));
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
