<script setup lang="ts">
import type { GroundPoint, LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { FISHING_ROD_COLOR, FISHING_ROD_HAND_HEIGHT, FISHING_ROD_OPTIONS } from "#src/services/fishing/constants";
import { createRodGeometry, createToonMaterial } from "genshin-engine";
import { Group, Mesh, Vector3 } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which the character stands on and the lure lies on
  getGroundHeight: (x: number, z: number) => number;
  // The point the lure lies at, which the rod is held toward
  lure: GroundPoint;
  lightUniforms: LightUniforms;
  // The character's feet, which the rod is held from at the hand's height
  target: GroundPoint;
  rampTexture: DataTexture;
}

const { getGroundHeight, lightUniforms, lure, rampTexture, target } = defineProps<Props>();
const material = createToonMaterial({ color: FISHING_ROD_COLOR, lightUniforms, rampTexture });
const geometry = createRodGeometry(FISHING_ROD_OPTIONS);
// The rod stands on its butt, so its group is set at the hand and turned to lie along the line toward the lure
const rodGroup = new Group();
rodGroup.add(new Mesh(geometry, material));
const up = new Vector3(0, 1, 0);
watchEffect(() => {
  const hand = new Vector3(target.x, getGroundHeight(target.x, target.z) + FISHING_ROD_HAND_HEIGHT, target.z);
  const tip = new Vector3(lure.x, getGroundHeight(lure.x, lure.z), lure.z);
  rodGroup.position.copy(hand);
  rodGroup.quaternion.setFromUnitVectors(up, tip.sub(hand).normalize());
});

onUnmounted(() => {
  geometry.dispose();
  material.dispose();
});
</script>

<template>
  <primitive :object="rodGroup" />
</template>
