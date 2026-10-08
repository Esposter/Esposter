<script setup lang="ts">
import type { LightUniforms, ToonNodeMaterial } from "genshin-engine";
import type { BufferGeometry, DataTexture, SkinnedMesh } from "three";

import { readCharacterMesh } from "#src/services/character/readCharacterMesh";

interface Props {
  characterId: string;
  characterPackBaseUrl: string;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}

const { characterId, characterPackBaseUrl, lightUniforms, rampTexture } = defineProps<Props>();
const mesh = shallowRef<SkinnedMesh<BufferGeometry, ToonNodeMaterial[]>>();
let isUnmounted = false;
const disposeMesh = ({ geometry, material, skeleton }: SkinnedMesh<BufferGeometry, ToonNodeMaterial[]>) => {
  geometry.dispose();
  skeleton.dispose();
  for (const characterMaterial of material) {
    characterMaterial.map?.dispose();
    characterMaterial.dispose();
  }
};
// The character's model from its pack, drawn once it has all arrived. A failure is logged and leaves nothing drawn, and
// A model arriving after its character has gone is released at once
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject
readCharacterMesh(characterPackBaseUrl, characterId, { lightUniforms, rampTexture }).match(
  (characterMesh) => {
    if (isUnmounted) disposeMesh(characterMesh);
    else mesh.value = characterMesh;
  },
  (error) => {
    console.error(error);
  },
);

onUnmounted(() => {
  isUnmounted = true;
  if (mesh.value) disposeMesh(mesh.value);
});
</script>

<template>
  <!-- An MMD model faces +z, turned half round to face -z as a yaw of none does, so it faces where whatever holds it does -->
  <primitive v-if="mesh" :object="mesh" :rotation-y="Math.PI" cast-shadow receive-shadow />
</template>
