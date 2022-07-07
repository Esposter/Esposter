<script setup lang="ts">
const ready = ref(false);

onMounted(async () => {
  const THREE = await import("three");
  const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
  const scene = new THREE.Scene();
  let gem: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial & THREE.MeshStandardMaterial>;
  let light: THREE.Object3D<THREE.Event>;
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("/3D/gem.gltf", (gltf) => {
    const textureLoader = new THREE.TextureLoader();
    const roughnessTexture = textureLoader.load("/3D/roughness.jpeg");
    gem = gltf.scene.children[6] as THREE.Mesh<
      THREE.BufferGeometry,
      THREE.MeshBasicMaterial & THREE.MeshStandardMaterial
    >;
    gem.material.roughnessMap = roughnessTexture;
    gem.material.displacementScale = 0.15;
    gem.material.emissiveIntensity = 0.4;
    gem.material.refractionRatio = 1;
    gem.rotation.z = 0;
    scene.add(gem);
    light = gltf.scene.children[0];
    scene.add(light);
    ready.value = true;
  });
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight2.position.set(-1, -1, -1);
  scene.add(directionalLight2);
  const sizes = { width: 200, height: 200 };
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
  camera.position.set(2, 2, 6);
  scene.add(camera);
  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.target.set(0, 0.75, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const clock = new THREE.Clock();
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
  <canvas class="webgl" :style="{ opacity: ready ? 1 : 0 }" />
</template>

<style scoped lang="scss">
.webgl {
  width: 200px;
  height: 200px;
  transition: opacity 1s ease;
}
</style>
