<script setup lang="ts">
import { WATERS_NORMALS_TEXTURE_PATH } from "@/services/visual/constants";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Inspector } from "three/examples/jsm/inspector/Inspector.js";
import { SkyMesh } from "three/examples/jsm/objects/SkyMesh.js";
import { WaterMesh } from "three/examples/jsm/objects/WaterMesh.js";
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RenderTarget,
  RepeatWrapping,
  Scene,
  TextureLoader,
  Vector3,
  WebGPURenderer,
} from "three/webgpu";

const containerRef = ref<HTMLElement | null>(null);
const parameters = { azimuth: 180, elevation: 2, exposure: 0.1 };
let renderer: WebGPURenderer;
let controls: OrbitControls;

onMounted(async () => {
  if (!containerRef.value) return;
  renderer = new WebGPURenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = parameters.exposure;
  renderer.inspector = new Inspector();
  containerRef.value.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(30, 30, 100);

  // Const renderPipeline = new RenderPipeline(renderer);
  // Const scenePass = pass(scene, camera);
  // Const scenePassColor = scenePass.getTextureNode("output");
  // Const bloomPass = bloom(scenePassColor);
  // BloomPass.threshold.value = 0;
  // BloomPass.strength.value = 0.1;
  // BloomPass.radius.value = 0;
  // RenderPipeline.outputNode = scenePassColor.add(bloomPass);

  const sun = new Vector3();
  const waterGeometry = new PlaneGeometry(10000, 10000);
  const loader = new TextureLoader();
  const waterNormals = loader.load(WATERS_NORMALS_TEXTURE_PATH);
  waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping;
  const water = new WaterMesh(waterGeometry, {
    distortionScale: 3.7,
    sunColor: 0xffffff,
    sunDirection: new Vector3(),
    waterColor: 0x001e0f,
    waterNormals,
  });
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  const sky = new SkyMesh();
  sky.scale.setScalar(10000);
  scene.add(sky);
  sky.turbidity.value = 10;
  sky.rayleigh.value = 2;
  sky.mieCoefficient.value = 0.005;
  sky.mieDirectionalG.value = 0.8;
  // Sky.cloudCoverage.value = 0.4;
  // Sky.cloudDensity.value = 0.5;
  // Sky.cloudElevation.value = 0.5;

  const pmremGenerator = new PMREMGenerator(renderer);
  const sceneEnv = new Scene();
  let renderTarget: RenderTarget | undefined;

  const updateSun = () => {
    const phi = MathUtils.degToRad(90 - parameters.elevation);
    const theta = MathUtils.degToRad(parameters.azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    sky.sunPosition.value.copy(sun);
    water.sunDirection.value.copy(sun).normalize();
    renderTarget?.dispose();
    sceneEnv.add(sky);
    renderTarget = pmremGenerator.fromScene(sceneEnv);
    scene.add(sky);
    scene.environment = renderTarget.texture;
  };

  await renderer.init();
  updateSun();

  const geometry = new BoxGeometry(30, 30, 30);
  const material = new MeshStandardMaterial({ roughness: 0 });
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40;
  controls.maxDistance = 200;
  controls.update();

  const gui = (renderer.inspector as Inspector).createParameters("Settings");
  const folderSky = gui.addFolder("Sky");
  folderSky.add(parameters, "elevation", 0, 90, 0.1).onChange(updateSun);
  folderSky.add(parameters, "azimuth", -180, 180, 0.1).onChange(updateSun);
  folderSky.add(parameters, "exposure", 0, 1, 0.0001).onChange((value: number) => {
    renderer.toneMappingExposure = value;
  });
  const folderWater = gui.addFolder("Water");
  folderWater.add(water.distortionScale, "value", 0, 8, 0.1).name("distortionScale");
  folderWater.add(water.size, "value", 0.1, 10, 0.1).name("size");
  // Const folderBloom = gui.addFolder("Bloom");
  // FolderBloom.add(bloomPass.strength, "value", 0, 3, 0.01).name("strength");
  // FolderBloom.add(bloomPass.radius, "value", 0, 1, 0.01).name("radius");
  // Const folderClouds = gui.addFolder("Clouds");
  // FolderClouds.add(sky.cloudCoverage, "value", 0, 1, 0.01).name("coverage");
  // FolderClouds.add(sky.cloudDensity, "value", 0, 1, 0.01).name("density");
  // FolderClouds.add(sky.cloudElevation, "value", 0, 1, 0.01).name("elevation");

  useEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const render = () => {
    const time = performance.now() * 0.001;
    mesh.position.y = Math.sin(time) * 20 + 5;
    mesh.rotation.x = time * 0.5;
    mesh.rotation.z = time * 0.51;
    renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(render);
});

onUnmounted(() => {
  renderer.setAnimationLoop(null);
  renderer.dispose();
  controls.dispose();
});
</script>

<template>
  <NuxtLayout>
    <div ref="containerRef" />
  </NuxtLayout>
</template>
