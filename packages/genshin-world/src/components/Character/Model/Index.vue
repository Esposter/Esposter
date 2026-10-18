<script setup lang="ts">
import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";
import type { LightUniforms, ToonNodeMaterial } from "genshin-engine";
import type { BufferGeometry, DataTexture, SkinnedMesh } from "three";

import { disposeCharacterMesh } from "#src/services/character/disposeCharacterMesh";
import { readCharacterMesh } from "#src/services/character/readCharacterMesh";

interface Props {
  // The character whose model this is, which sets the metres its PMX unit stands for
  characterId: number;
  // Where the character's pack is read from, the browser's kept copy or the host's
  characterPackReader: CharacterPackReader;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}

const { characterId, characterPackReader, lightUniforms, rampTexture } = defineProps<Props>();
const emit = defineEmits<{ error: [] }>();
const mesh = shallowRef<SkinnedMesh<BufferGeometry, ToonNodeMaterial[]>>();
let isUnmounted = false;
// The character's model from its pack, drawn once it has all arrived. A failure is logged and emitted, leaving what holds
// The model to draw something in its place, and a model arriving after its character has gone is released at once
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject
readCharacterMesh(characterPackReader, { characterId, lightUniforms, rampTexture }).match(
  (characterMesh) => {
    if (isUnmounted) disposeCharacterMesh(characterMesh);
    else mesh.value = characterMesh;
  },
  (error) => {
    console.error(error);
    emit("error");
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
