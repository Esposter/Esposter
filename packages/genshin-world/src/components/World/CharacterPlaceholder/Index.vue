<script setup lang="ts">
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { CHARACTER_PLACEHOLDER_COLOR } from "#src/services/constants";
import { getCharacterLocomotion } from "#src/services/world/locomotion/getCharacterLocomotion";
import { createToonMaterial } from "genshin-engine";
import { CapsuleGeometry } from "three";

interface Props {
  characterId: number;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}

const { characterId, lightUniforms, rampTexture } = defineProps<Props>();
// The character's body's capsule, stood on its feet, drawn where no model of it is
const placeholderGeometry = computed(() => {
  const { capsuleHeight, capsuleRadius } = getCharacterLocomotion(characterId);
  return new CapsuleGeometry(capsuleRadius, capsuleHeight - capsuleRadius * 2).translate(0, capsuleHeight / 2, 0);
});
const placeholderMaterial = createToonMaterial({ color: CHARACTER_PLACEHOLDER_COLOR, lightUniforms, rampTexture });

watch(placeholderGeometry, (_newPlaceholderGeometry, oldPlaceholderGeometry) => {
  oldPlaceholderGeometry.dispose();
});

onUnmounted(() => {
  placeholderGeometry.value.dispose();
  placeholderMaterial.dispose();
});
</script>

<template>
  <TresMesh :geometry="placeholderGeometry" :material="placeholderMaterial" cast-shadow />
</template>
