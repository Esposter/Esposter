<script setup lang="ts">
import type { BufferGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three/webgpu";

import gemGltfUrl from "@/assets/visual/textures/gem.gltf?url";
import roughnessUrl from "@/assets/visual/textures/roughness.jpeg?url";
import { Vector3 } from "three/webgpu";

const { state: gltf } = useGLTF(gemGltfUrl);
const { state: roughnessMap } = useTexture(roughnessUrl);
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
  <TresDirectionalLight :intensity="6" :position="new Vector3(1, 1, 1)" />
  <TresDirectionalLight :intensity="6" :position="new Vector3(-1, -1, -1)" />
  <primitive v-if="gem" :object="gem" dispose />
</template>
