<script setup lang="ts">
import type { BufferGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three/webgpu";

import { Vector3 } from "three/webgpu";

import { GEM_GLTF_PATH, ROUGHNESS_TEXTURE_PATH } from "@/services/visual/constants";

const keyLightPosition = new Vector3(1, 1, 1);
const fillLightPosition = new Vector3(-1, -1, -1);
const { state: gltf } = useGLTF(GEM_GLTF_PATH);
const { state: roughnessMap } = useTexture(ROUGHNESS_TEXTURE_PATH);
const gem = computed(
  () => gltf.value?.scene.children[0] as Mesh<BufferGeometry, MeshBasicMaterial & MeshStandardMaterial> | undefined,
);
const { onRender } = useLoop();

onRender(({ elapsed }) => {
  if (!gem.value) return;
  gem.value.rotation.y = 1.1 * elapsed;
});

watch([gem, roughnessMap], ([newGem, newRoughnessMap]) => {
  if (!newGem) return;
  newGem.material.roughnessMap = newRoughnessMap;
  newGem.material.displacementScale = 0.15;
  newGem.material.emissiveIntensity = 0;
  newGem.material.refractionRatio = 1;
});
</script>

<template>
  <TresAmbientLight :intensity="4" />
  <TresDirectionalLight :intensity="6" :position="keyLightPosition" />
  <TresDirectionalLight :intensity="6" :position="fillLightPosition" />
  <primitive v-if="gem" :object="gem" dispose />
</template>
