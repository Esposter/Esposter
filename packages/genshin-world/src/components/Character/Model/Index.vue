<script setup lang="ts">
import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";
import type { LightUniforms, ToonNodeMaterial } from "genshin-engine";
import type { BufferGeometry, DataTexture, SkinnedMesh } from "three";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { disposeCharacterMesh } from "#src/services/character/disposeCharacterMesh";
import { readCharacterMesh } from "#src/services/character/readCharacterMesh";

interface Props {
  // The character whose model this is, which sets the metres its PMX unit stands for
  characterId: number;
  // Where the character's pack is read from, the cache the opening downloaded it into
  characterPackReader: CharacterPackReader;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}

const { characterId, characterPackReader, lightUniforms, rampTexture } = defineProps<Props>();
const emit = defineEmits<{ error: [characterId: number] }>();
const mesh = shallowRef<SkinnedMesh<BufferGeometry, ToonNodeMaterial[]>>();
let isUnmounted = false;
// The character's model from its pack, drawn once it has all arrived. A failure is logged and emitted with its character,
// So the field draws another model in its place, and a model arriving after its character has gone is released at once
readCharacterMesh(characterPackReader, { characterId, lightUniforms, rampTexture }).match(
  (characterMesh) => {
    if (isUnmounted) disposeCharacterMesh(characterMesh);
    else mesh.value = characterMesh;
  },
  (error) => {
    // Logged here rather than by the parent, since an emit is dropped once this model has unmounted
    if (characterId === TRAVELER_CHARACTER_ID) console.error(error);
    else console.error(`Character ${characterId}'s model failed to read`, error);
    emit("error", characterId);
  },
);

onUnmounted(() => {
  isUnmounted = true;
  if (mesh.value) disposeCharacterMesh(mesh.value);
});
</script>

<template>
  <!-- An MMD model faces +z, turned half round to face -z as a yaw of none does, so it faces where whatever holds it does -->
  <primitive v-if="mesh" :object="mesh" :rotation-y="Math.PI" cast-shadow receive-shadow />
</template>
