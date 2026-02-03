<script setup lang="ts">
import { takeOne } from "@esposter/shared";
import { useResizeObserver } from "@vueuse/core";
import * as THREE from "three";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const drawer = ref(true);
const parameters = ref({
  branches: 3,
  count: 100000,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
  radius: 5,
  randomness: 0.2,
  randomnessPower: 3,
  size: 0.01,
  speed: 1,
  spin: 1,
});

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let geometry: THREE.BufferGeometry;
let material: THREE.PointsMaterial;
let points: THREE.Points | undefined;
let animationFrameId: number;
const clock = new THREE.Clock();

// --- Galaxy Generation ---
const generateGalaxy = () => {
  if (points) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.value.count * 3);
  const colors = new Float32Array(parameters.value.count * 3);

  const colorInside = new THREE.Color(parameters.value.insideColor);
  const colorOutside = new THREE.Color(parameters.value.outsideColor);

  for (let i = 0; i < parameters.value.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parameters.value.radius;
    const spinAngle = radius * parameters.value.spin;
    const branchAngle = ((i % parameters.value.branches) / parameters.value.branches) * Math.PI * 2;
    const randomX =
      Math.random() ** parameters.value.randomnessPower *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.value.randomness *
      radius;
    const randomY =
      Math.random() ** parameters.value.randomnessPower *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.value.randomness *
      radius;
    const randomZ =
      Math.random() ** parameters.value.randomnessPower *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.value.randomness *
      radius;
    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.value.radius);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  material = new THREE.PointsMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    size: parameters.value.size,
    sizeAttenuation: true,
    vertexColors: true,
  });
  points = new THREE.Points(geometry, material);
  scene.add(points);
};

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (points) points.rotation.y = elapsedTime * (parameters.value.speed * 0.2);

  renderer.render(scene, camera);
  animationFrameId = requestAnimationFrame(tick);
};
onMounted(() => {
  if (!canvasRef.value || !containerRef.value) return;
  scene = new THREE.Scene();
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
  camera.position.x = 3;
  camera.position.y = 3;
  camera.position.z = 3;
  camera.lookAt(0, 0, 0); // Need OrbitControls effectively but doing simple lookAt for now or adding interaction??
  // Let's stick to simple rotation for now, maybe add OrbitControls if user wants interaction.
  // Actually, let's implement basic OrbitControls logic or just camera movement if requested.
  // For now, static camera looking at center, galaxy rotates.
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvasRef.value,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  generateGalaxy();
  tick();

  useResizeObserver(containerRef, (entries) => {
    const entry = takeOne(entries);
    const { height, width } = entry.contentRect;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  geometry.dispose();
  material.dispose();
  renderer.dispose();
});

watch(
  parameters,
  () => {
    generateGalaxy();
  },
  { deep: true },
);
</script>

<template>
  <div ref="containerRef" relative w-full h-full bg-black overflow-hidden>
    <canvas ref="canvasRef" block w-full h-full></canvas>

    <!-- Controls Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      location="right"
      permanent
      width="350"
      bg-opacity-90
      backdrop-blur-md
      color="surface"
      floating
    >
      <div pa-4>
        <div text-h6 font-weight-bold mb-4 d-flex align-center justify-space-between>
          <span>Galaxy Generator</span>
          <v-icon icon="mdi-creation" color="primary"></v-icon>
        </div>

        <v-divider mb-4></v-divider>

        <v-slider
          v-model="parameters.count"
          label="Star Count"
          :min="1000"
          :max="500000"
          :step="1000"
          thumb-label
          color="primary"
          hide-details
          mb-4
        ></v-slider>

        <v-slider
          v-model="parameters.size"
          label="Star Size"
          :min="0.001"
          :max="0.1"
          :step="0.001"
          thumb-label
          color="primary"
          hide-details
          mb-4
        ></v-slider>

        <v-slider
          v-model="parameters.radius"
          label="Radius"
          :min="0.1"
          :max="20"
          :step="0.1"
          thumb-label
          color="secondary"
          hide-details
          mb-4
        ></v-slider>

        <v-slider
          v-model="parameters.branches"
          label="Branches"
          :min="2"
          :max="20"
          :step="1"
          thumb-label
          color="secondary"
          hide-details
          mb-4
        ></v-slider>

        <v-slider
          v-model="parameters.spin"
          label="Spin"
          :min="-5"
          :max="5"
          :step="0.01"
          thumb-label
          color="info"
          hide-details
          mb-4
        ></v-slider>

        <v-slider
          v-model="parameters.randomness"
          label="Randomness"
          :min="0"
          :max="2"
          :step="0.01"
          thumb-label
          color="warning"
          hide-details
          mb-4
        ></v-slider>

        <v-slider
          v-model="parameters.randomnessPower"
          label="Randomness Power"
          :min="1"
          :max="10"
          :step="0.1"
          thumb-label
          color="warning"
          hide-details
          mb-4
        ></v-slider>

        <div mb-4>
          <div text-subtitle-2 mb-2>Inside Color</div>
          <v-color-picker
            v-model="parameters.insideColor"
            mode="hex"
            hide-inputs
            hide-canvas
            width="100%"
            elevation-0
          ></v-color-picker>
        </div>

        <div mb-4>
          <div text-subtitle-2 mb-2>Outside Color</div>
          <v-color-picker
            v-model="parameters.outsideColor"
            mode="hex"
            hide-inputs
            hide-canvas
            width="100%"
            elevation-0
          ></v-color-picker>
        </div>

        <v-slider
          v-model="parameters.speed"
          label="Rotation Speed"
          :min="0"
          :max="10"
          :step="0.1"
          thumb-label
          color="error"
          hide-details
        ></v-slider>
      </div>
    </v-navigation-drawer>

    <!-- Toggle Button -->
    <v-btn
      icon="mdi-cog"
      position="absolute"
      location="top right"
      ma-4
      variant="tonal"
      color="white"
      z-index-100
      @click="drawer = !drawer"
    ></v-btn>
  </div>
</template>

<style scoped>
/* Ensure canvas fits */
canvas {
  outline: none;
}
</style>
