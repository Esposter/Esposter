<script setup lang="ts">
import type { GroundPoint, LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { useDisposedMesh } from "#src/composables/useDisposedMesh";
import { FISHING_ROD_COLOR, FISHING_ROD_HAND_HEIGHT, FISHING_ROD_OPTIONS } from "#src/services/fishing/constants";
import { watchImmediate } from "@vueuse/core";
import { createRodGeometry, createToonMaterial } from "genshin-engine";
import { Group, Vector3 } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which the character stands on and the lure lies on
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  // The point the lure lies at, which the rod is held toward
  lure: GroundPoint;
  rampTexture: DataTexture;
  // The character's feet, which the rod is held from at the hand's height
  target: GroundPoint;
}

const { getGroundHeight, lightUniforms, lure, rampTexture, target } = defineProps<Props>();
const material = createToonMaterial({ color: FISHING_ROD_COLOR, lightUniforms, rampTexture });
const geometry = createRodGeometry(FISHING_ROD_OPTIONS);
// The rod stands on its butt, so its group is set at the hand and turned to lie along the line toward the lure
const rodGroup = new Group();
rodGroup.add(useDisposedMesh(geometry, material));
const up = new Vector3(0, 1, 0);
watchImmediate(
  [
    () => target.x,
    () => target.z,
    () => getGroundHeight(target.x, target.z),
    () => lure.x,
    () => lure.z,
    () => getGroundHeight(lure.x, lure.z),
  ],
  ([targetX, targetZ, targetHeight, lureX, lureZ, lureHeight]) => {
    const hand = new Vector3(targetX, targetHeight + FISHING_ROD_HAND_HEIGHT, targetZ);
    const tip = new Vector3(lureX, lureHeight, lureZ);
    rodGroup.position.copy(hand);
    rodGroup.quaternion.setFromUnitVectors(up, tip.sub(hand).normalize());
  },
);
</script>

<template>
  <primitive :object="rodGroup" />
</template>
