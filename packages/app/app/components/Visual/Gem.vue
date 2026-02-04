<script setup lang="ts">
import type { BufferGeometry, Light, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";

import { GEM_GLTF_PATH, ROUGHNESS_TEXTURE_PATH } from "@/services/visual/constants";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  AmbientLight,
  Clock,
  DirectionalLight,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  TextureLoader,
  WebGPURenderer,
} from "three/webgpu";

const isReady = ref(false);
const id = "gem";
const width = 200;
const height = 200;
let renderer: WebGPURenderer;
let controls: OrbitControls;
let animationFrameId: number;

onMounted(async () => {
  const canvas = document.getElementById(id) as HTMLCanvasElement | null;
  if (!canvas) return;
  const scene = new Scene();
  let gem: Mesh<BufferGeometry, MeshBasicMaterial & MeshStandardMaterial> | undefined;
  let light: Light;

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(GEM_GLTF_PATH, (gltf) => {
    light = gltf.scene.children[6] as Light;
    scene.add(light);

    const textureLoader = new TextureLoader();
    const roughnessTexture = textureLoader.load(ROUGHNESS_TEXTURE_PATH);
    gem = gltf.scene.children[0] as Mesh<BufferGeometry, MeshBasicMaterial & MeshStandardMaterial>;
    gem.material.roughnessMap = roughnessTexture;
    gem.material.displacementScale = 0.15;
    gem.material.emissiveIntensity = 0;
    gem.material.refractionRatio = 1;
    scene.add(gem);
    isReady.value = true;
  });

  const ambientLight = new AmbientLight(0xffffff, 4);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 6);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const directionalLight2 = new DirectionalLight(0xffffff, 6);
  directionalLight2.position.set(-1, -1, -1);
  scene.add(directionalLight2);

  const camera = new PerspectiveCamera(75, width / height, 0.1, 100);
  camera.position.set(2, 2, 6);
  scene.add(camera);

  controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.target.set(0, 0.75, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;

  renderer = new WebGPURenderer({ alpha: true, antialias: true, canvas });
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const clock = new Clock();
  const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    if (gem) gem.rotation.y = 1.1 * elapsedTime;
    controls.update();
    renderer.render(scene, camera);
    animationFrameId = window.requestAnimationFrame(animate);
  };
  await renderer.init();
  animate();
});

onUnmounted(() => {
  window.cancelAnimationFrame(animationFrameId);
  renderer.dispose();
  controls.dispose();
});
</script>

<template>
  <TransitionFade>
    <canvas v-show="isReady" :id />
  </TransitionFade>
</template>
