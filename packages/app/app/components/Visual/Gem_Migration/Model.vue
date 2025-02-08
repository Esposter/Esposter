<script setup lang="ts">
import type { BufferGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";

import { GEM_GLTF_PATH, ROUGHNESS_TEXTURE_PATH } from "@/services/visual/constants";
import { TextureLoader } from "three";

const { nodes } = await useGLTF(GEM_GLTF_PATH);
const textureLoader = new TextureLoader();
const roughnessTexture = textureLoader.load(ROUGHNESS_TEXTURE_PATH);
const gem = nodes.Cube as Mesh<BufferGeometry, MeshBasicMaterial & MeshStandardMaterial>;
gem.material.roughnessMap = roughnessTexture;
gem.material.displacementScale = 0.15;
gem.material.emissiveIntensity = 0;
gem.material.refractionRatio = 1;

const { onBeforeRender } = useLoop();

onBeforeRender(({ delta }) => {
  gem.rotation.y = 1.1 * delta;
});
</script>

<template>
  <primitive v-for="node in nodes" :key="node.name" :object="node" />
</template>
