<script setup lang="ts">
import type ThreeGlobe from "three-globe";

import { dayjs } from "#shared/services/dayjs";
import { createRandomInteger } from "#shared/util/math/random/createRandomInteger";
import countries from "@/assets/about/countries.json";
import data from "@/assets/about/data.json";
import { features } from "@/assets/about/globe.json";
import { ARC_STROKES, COLORS } from "@/services/visual/constants";
import { getRandomValues } from "@/util/math/random/getRandomValues";
import { takeOne } from "@esposter/shared";
import {
  AmbientLight,
  DirectionalLight,
  Fog,
  MeshPhongMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Data = (typeof data)[number];

const {
  arcLength,
  arcTime,
  atmosphereAltitude,
  atmosphereColor,
  color,
  emissive,
  emissiveIntensity,
  hexPolygonColor,
  ringMaxRadius,
  rings,
  shininess,
  showAtmosphere,
} = {
  arcLength: 0.9,
  arcTime: dayjs.duration(2, "second").asMilliseconds(),
  atmosphereAltitude: 0.25,
  atmosphereColor: "#3a228a",
  color: "#3a228a",
  emissive: "#220038",
  emissiveIntensity: 0.1,
  hexPolygonColor: "rgba(255,255,255,0.7)",
  ringMaxRadius: 3,
  rings: 3,
  shininess: 0.7,
  showAtmosphere: true,
};
const id = "globe";
const { width } = useWindowSize();
const height = computed(() => width.value);
let renderer: WebGLRenderer;
let controls: OrbitControls;
let ambientLight: AmbientLight;
let directionLight: DirectionalLight;
let directionLight1: DirectionalLight;
let pointLight: PointLight;
let globe: ThreeGlobe;
let animationFrameId: number;
let intervalId: number;

onMounted(async () => {
  const canvas = document.getElementById(id) as HTMLCanvasElement;
  renderer = new WebGLRenderer({ antialias: true, canvas });
  renderer.setClearColor(0x000, 0);
  renderer.setSize(width.value, height.value);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  ambientLight = new AmbientLight(0xbbb, 0.3);
  scene.add(ambientLight);

  const camera = new PerspectiveCamera();
  camera.aspect = width.value / height.value;
  camera.updateProjectionMatrix();
  camera.position.z = 400;
  camera.position.x = 0;
  camera.position.y = 0;

  directionLight = new DirectionalLight(0xfff, 0.8);
  directionLight.position.set(-800, 2000, 400);
  camera.add(directionLight);

  directionLight1 = new DirectionalLight(0x7982f6, 1);
  directionLight1.position.set(-200, 500, 200);
  camera.add(directionLight1);

  pointLight = new PointLight(0x8566cc, 0.5);
  pointLight.position.set(-200, 500, 200);
  camera.add(pointLight);

  scene.add(camera);
  scene.fog = new Fog(0x535ef3, 400, 2000);

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 300;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 1;
  controls.autoRotate = false;
  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  const ThreeGlobe = (await import("three-globe")).default;
  const globeMaterial = new MeshPhongMaterial({ color, emissive, emissiveIntensity, shininess });
  globe = new ThreeGlobe({ animateIn: true, waitForGlobeReady: true })
    .globeMaterial(globeMaterial)
    .hexPolygonsData(features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(showAtmosphere)
    .atmosphereColor(atmosphereColor)
    .atmosphereAltitude(atmosphereAltitude)
    .hexPolygonColor(() => hexPolygonColor)
    .arcsData(data)
    .arcStartLat((d) => (d as Data).startLat)
    .arcStartLng((d) => (d as Data).startLng)
    .arcEndLat((d) => (d as Data).endLat)
    .arcEndLng((d) => (d as Data).endLng)
    .arcColor(() => takeOne(COLORS, createRandomInteger(COLORS.length - 1)))
    .arcAltitude((e) => (e as Data).arcAlt)
    .arcStroke(() => takeOne(ARC_STROKES, createRandomInteger(ARC_STROKES.length - 1)))
    .arcDashLength(arcLength)
    .arcDashInitialGap((e) => (e as Data).order)
    .arcDashGap(15)
    .arcDashAnimateTime(arcTime)
    // Sadly, the browser is not powerful enough to render all the labels
    .labelsData(getRandomValues(countries, 50))
    .labelColor(() => "#fff")
    .labelDotOrientation(() => "right")
    .labelDotRadius(0.3)
    .labelSize(() => 1)
    .labelText("name")
    .labelResolution(6)
    .labelAltitude(0.01)
    .pointsData(countries)
    .pointColor(() => takeOne(COLORS, createRandomInteger(COLORS.length - 1)))
    .pointsMerge(true)
    .pointAltitude(0)
    .pointRadius(1)
    .ringsData(getRandomValues(countries, rings))
    .ringColor(() => takeOne(COLORS, createRandomInteger(COLORS.length - 1)))
    .ringMaxRadius(ringMaxRadius)
    .ringPropagationSpeed(3)
    .ringRepeatPeriod(arcTime * arcLength);
  globe.rotateY(-Math.PI * (5 / 9)).rotateZ(-Math.PI / 6);
  scene.add(globe);

  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();

  useEventListener("resize", () => {
    camera.aspect = width.value / height.value;
    camera.updateProjectionMatrix();
    renderer.setSize(width.value, height.value);
  });

  intervalId = window.setInterval(() => {
    globe.ringsData(getRandomValues(countries, rings));
  }, dayjs.duration(2, "seconds").asMilliseconds());
});

onUnmounted(() => {
  window.cancelAnimationFrame(animationFrameId);
  window.clearInterval(intervalId);
  ambientLight.dispose();
  directionLight.dispose();
  directionLight1.dispose();
  pointLight.dispose();
  globe.globeMaterial().dispose();
  controls.dispose();
  renderer.dispose();
});
</script>

<template>
  <canvas :id />
</template>
