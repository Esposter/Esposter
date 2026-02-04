<script setup lang="ts">
import type { BufferGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three/webgpu";

import { GEM_GLTF_PATH, ROUGHNESS_TEXTURE_PATH } from "@/services/visual/constants";
import { shallowRef } from "vue";

const gemRef = shallowRef<Mesh<BufferGeometry, MeshBasicMaterial & MeshStandardMaterial>>();
const { state: gltf } = useGLTF(GEM_GLTF_PATH);
const { state: roughnessMap } = useTexture(ROUGHNESS_TEXTURE_PATH);
const gem = computed(
  () => gltf.value?.scene.children[0] as Mesh<BufferGeometry, MeshBasicMaterial & MeshStandardMaterial> | undefined,
);
const light = computed(() => gltf.value?.scene.children[6]);
const { onRender } = useLoop();

onRender(({ elapsed }) => {
  if (!gemRef.value) return;
  gemRef.value.rotation.y = 1.1 * elapsed;
});

watchEffect(() => {
  if (!gem.value) return;
  gem.value.material.roughnessMap = roughnessMap.value;
  gem.value.material.displacementScale = 0.15;
  gem.value.material.emissiveIntensity = 0;
  gem.value.material.refractionRatio = 1;
});
</script>

<template>
  <TresAmbientLight :intensity="4" />
  <TresDirectionalLight :intensity="6" :position="[1, 1, 1]" />
  <TresDirectionalLight :intensity="6" :position="[-1, -1, -1]" />
  <primitive v-if="gem" ref="gemRef" :object="gem" />
  <primitive v-if="light" :object="light" />
</template>
