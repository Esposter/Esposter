<script setup lang="ts">
import { useLoop, useTres } from "@tresjs/core";
import type { FogUniforms, LightUniforms, SkyUniforms, WaterUniforms } from "genshin-engine";

import { WATER_SURFACE_SIZE } from "#src/services/constants";
import { createUnderwaterFogState, createWaterMaterial, updateUnderwaterFog } from "genshin-engine";
import { Mesh, PlaneGeometry, Vector3 } from "three";

interface Props {
  fogUniforms: FogUniforms;
  lightUniforms: LightUniforms;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
  skyUniforms: SkyUniforms;
  waterUniforms: WaterUniforms;
}

const { fogUniforms, lightUniforms, origin, skyUniforms, waterUniforms } = defineProps<Props>();
const { camera } = useTres();
const { onBeforeRender } = useLoop();
// One square of water at the region's level, kept under the camera, so every sea and lake the ground dips beneath
// Shows through it and the ground hides it everywhere else: one draw for all of them
const waterGeometry = new PlaneGeometry(WATER_SURFACE_SIZE, WATER_SURFACE_SIZE).rotateX(-Math.PI / 2);
const waterMaterial = createWaterMaterial(lightUniforms, skyUniforms, waterUniforms);
const water = new Mesh(waterGeometry, waterMaterial);
const underwaterFogState = createUnderwaterFogState();
const eye = new Vector3();
// After the sky, whose fog colour the water's replaces while the eye is under the surface
onBeforeRender(() => {
  const activeCamera = camera.value;
  if (!activeCamera) return;
  eye.copy(activeCamera.position).add(origin);
  water.position.set(Math.round(eye.x), waterUniforms.level.value, Math.round(eye.z));
  updateUnderwaterFog(eye.y, waterUniforms, fogUniforms, underwaterFogState);
});

onUnmounted(() => {
  waterGeometry.dispose();
  waterMaterial.dispose();
});
</script>

<template>
  <primitive :object="water" />
</template>
