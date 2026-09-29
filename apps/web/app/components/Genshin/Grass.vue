<script setup lang="ts">
import type {
  GrassRing,
  LightUniforms,
  QualityTier,
  TerrainOptions,
  WaterUniforms,
  WindUniforms,
} from "genshin-engine";
import type { DataTexture } from "three";

import {
  GRASS_BLADE_SEGMENT_COUNT,
  GRASS_CAPTURE_RESOLUTION,
  GRASS_CAPTURE_SIZE,
  GRASS_RECAPTURE_DISTANCE,
} from "@/services/genshin/constants";
import { isWebGPURenderer } from "@tresjs/core";
import {
  createGrassGeometry,
  createGrassMaterial,
  createGroundCapture,
  QualityTierSettingsMap,
  renderGroundCapture,
} from "genshin-engine";
import { Mesh, Vector2, Vector3 } from "three";
import { uniform } from "three/tsl";

interface Props {
  bladeHeight: number;
  bladeWidth: number;
  lightUniforms: LightUniforms;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
  qualityTier: QualityTier;
  rampTexture: DataTexture;
  rings: GrassRing[];
  // Counts every change to the ground under the view, so the capture is redrawn when a tile arrives
  terrainChanges: { count: number };
  terrainOptions: TerrainOptions;
  waterUniforms: WaterUniforms;
  windUniforms: WindUniforms;
}

const {
  bladeHeight,
  bladeWidth,
  lightUniforms,
  origin,
  qualityTier,
  rampTexture,
  rings,
  terrainChanges,
  terrainOptions,
  waterUniforms,
  windUniforms,
} = defineProps<Props>();
const { camera, renderer, scene } = useTres();
const { onBeforeRender } = useLoop();
const cameraGround = uniform(new Vector2());
const density = uniform(QualityTierSettingsMap[qualityTier].grassDensity);
const groundCapture = createGroundCapture(GRASS_CAPTURE_SIZE, GRASS_CAPTURE_RESOLUTION);
// One mesh a ring, each a single draw of its every blade, placed in the vertex stage and so never culled whole
const grassMeshes = rings.map((ring) => {
  const grassMesh = new Mesh(
    createGrassGeometry(GRASS_BLADE_SEGMENT_COUNT, ring.cellsPerSide * ring.cellsPerSide),
    createGrassMaterial({
      bladeHeight,
      bladeWidth,
      cameraGround,
      density,
      groundCapture,
      lightUniforms,
      rampTexture,
      ring,
      waterUniforms,
      windUniforms,
    }),
  );
  grassMesh.frustumCulled = false;
  grassMesh.receiveShadow = true;
  return grassMesh;
});
const eye = new Vector3();
const captureCenter = new Vector3();
let capturedChangeCount = -1;
// The capture is redrawn only when the camera has crossed part of it or the ground under it has changed
onBeforeRender(() => {
  const activeCamera = camera.value;
  if (!activeCamera || !isWebGPURenderer(renderer)) return;
  eye.copy(activeCamera.position).add(origin);
  cameraGround.value.set(eye.x, eye.z);
  const isFar = Math.hypot(eye.x - captureCenter.x, eye.z - captureCenter.z) > GRASS_RECAPTURE_DISTANCE;
  if (!isFar && capturedChangeCount === terrainChanges.count) return;
  captureCenter.set(Math.round(eye.x), 0, Math.round(eye.z));
  capturedChangeCount = terrainChanges.count;
  renderGroundCapture(renderer, scene.value, groundCapture, terrainOptions, captureCenter, origin);
});

onUnmounted(() => {
  for (const grassMesh of grassMeshes) {
    grassMesh.geometry.dispose();
    grassMesh.material.dispose();
  }
  groundCapture.renderTarget.dispose();
  groundCapture.material.dispose();
});
</script>

<template>
  <primitive v-for="grassMesh of grassMeshes" :key="grassMesh.uuid" :object="grassMesh" />
</template>
