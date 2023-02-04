<script setup lang="ts">
import {
AmbientLight,
BufferGeometry,
Clock,
DirectionalLight,
Light,
Mesh,
MeshBasicMaterial,
MeshStandardMaterial,
PCFSoftShadowMap,
PerspectiveCamera,
Scene,
TextureLoader,
WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let ready = $ref(false);
const opacity = $computed(() => (ready ? 1 : 0));

onMounted(() => {
  // Canvas
  const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;

  // Scene
  const scene = new Scene();

  // Models
  let gem: Mesh<BufferGeometry, MeshBasicMaterial & MeshStandardMaterial>;
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
    gem.material.emissiveIntensity = 0.4;
    gem.material.refractionRatio = 1;
    scene.add(gem);
    ready = true;
  });

  // Lighting
  const ambientLight = new AmbientLight(0xffffff, 2);
  scene.add(ambientLight);
  const directionalLight = new DirectionalLight(0xffffff, 3);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  const directionalLight2 = new DirectionalLight(0xffffff, 3);
  directionalLight2.position.set(-1, -1, -1);
  scene.add(directionalLight2);

  // Settings
  const sizes = { width: 200, height: 200 };

  // Camera
  const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
  camera.position.set(2, 2, 6);
  scene.add(camera);

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.target.set(0, 0.75, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;

  // Render
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Animations
  const clock = new Clock();
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    if (gem) gem.rotation.y = 1.1 * elapsedTime;
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };
  tick();
});
</script>

<template>
  <canvas class="webgl" />
</template>

<style scoped lang="scss">
.webgl {
  width: 200px;
  height: 200px;
  opacity: v-bind(opacity);
  transition: opacity 1s ease;
}
</style>
