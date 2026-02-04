<script setup lang="ts">
import type { BufferGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three/webgpu";

import { GEM_GLTF_PATH, ROUGHNESS_TEXTURE_PATH } from "@/services/visual/constants";
import { shallowRef } from "vue";

const gemRef = shallowRef<Mesh<BufferGeometry, MeshBasicMaterial & MeshStandardMaterial>>();
const { state: gltf } = useGLTF(GEM_GLTF_PATH);
const { state: roughnessMap } = useTexture(ROUGHNESS_TEXTURE_PATH);
const gem = computed(() => {
  const gem = gltf.value?.scene.children[0] as
    | Mesh<BufferGeometry, MeshBasicMaterial & MeshStandardMaterial>
    | undefined;
  if (!gem) return undefined;
  gem.material.roughnessMap = roughnessMap.value;
  gem.material.displacementScale = 0.15;
  gem.material.emissiveIntensity = 0;
  gem.material.refractionRatio = 1;
  return gem;
});
const light = computed(() => gltf.value?.scene.children[6]);
const { onRender } = useLoop();

onRender(({ elapsed }) => {
  if (!gemRef.value) return;
  gemRef.value.rotation.y = 1.1 * elapsed;
});
</script>

<template>
  <TresAmbientLight :intensity="4" />
  <TresDirectionalLight :intensity="6" :position="[1, 1, 1]" />
  <TresDirectionalLight :intensity="6" :position="[-1, -1, -1]" />
  <primitive v-if="gem" ref="gemRef" :object="gem" />
  <primitive v-if="light" :object="light" />
</template>
