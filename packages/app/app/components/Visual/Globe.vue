<script setup lang="ts">
import type { MeshPhongMaterial } from "three";
import type { ArrayElement } from "type-fest/source/internal";

import { dayjs } from "#shared/services/dayjs";
import { generateRandomInteger } from "#shared/util/math/random/generateRandomInteger";
import data from "@/assets/about/data.json";
import countries from "@/assets/about/globe.json";
import { ARC_STROKES, COLORS } from "@/services/visual/constants";
import { AmbientLight, Color, DirectionalLight, Fog, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Data = ArrayElement<typeof data>;

const id = "globe";
const { width } = useWindowSize();
const height = computed(() => width.value);

onMounted(async () => {
  const canvas = document.querySelector<HTMLCanvasElement>(`#${id}`);
  if (!canvas) return;
  const renderer = new WebGLRenderer({ antialias: true, canvas });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(width.value, height.value);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  scene.add(new AmbientLight(0xbbbbbb, 0.3));

  const camera = new PerspectiveCamera();
  camera.aspect = width.value / height.value;
  camera.updateProjectionMatrix();
  camera.position.z = 400;
  camera.position.x = 0;
  camera.position.y = 0;

  const dLight = new DirectionalLight(0xffffff, 0.8);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  const dLight1 = new DirectionalLight(0x7982f6, 1);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);

  const dLight2 = new PointLight(0x8566cc, 0.5);
  dLight2.position.set(-200, 500, 200);
  camera.add(dLight2);

  scene.add(camera);
  scene.fog = new Fog(0x535ef3, 400, 2000);

  const controls = new OrbitControls(camera, canvas);
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
  const globe = new ThreeGlobe({ animateIn: true, waitForGlobeReady: true })
    .hexPolygonsData(countries.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(true)
    .atmosphereColor("#3a228a")
    .atmosphereAltitude(0.25)
    .hexPolygonColor(() => "rgba(255,255,255,0.7)");
  globe.rotateY(-Math.PI * (5 / 9));
  globe.rotateZ(-Math.PI / 6);
  globe
    .arcsData(data)
    .arcStartLat((d) => (d as Data).startLat)
    .arcStartLng((d) => (d as Data).startLng)
    .arcEndLat((d) => (d as Data).endLat)
    .arcEndLng((d) => (d as Data).endLng)
    .arcColor(() => COLORS[generateRandomInteger(COLORS.length - 1)])
    .arcAltitude((e) => (e as Data).arcAlt)
    .arcStroke(() => ARC_STROKES[generateRandomInteger(ARC_STROKES.length - 1)])
    .arcDashLength(0.9)
    .arcDashInitialGap((e) => (e as Data).order)
    .arcDashGap(15)
    .arcDashAnimateTime(dayjs.duration(2, "second").asMilliseconds())
    .arcsTransitionDuration(dayjs.duration(2, "second").asMilliseconds())
    .pointsData(data)
    .pointColor(() => COLORS[generateRandomInteger(COLORS.length - 1)])
    .pointsMerge(true)
    .pointAltitude(0.07)
    .pointRadius(0.05);

  const globeMaterial = globe.globeMaterial() as MeshPhongMaterial;
  globeMaterial.color = new Color(0x3a228a);
  globeMaterial.emissive = new Color(0x220038);
  globeMaterial.emissiveIntensity = 0.1;
  globeMaterial.shininess = 0.7;
  scene.add(globe);

  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();

  useEventListener("resize", () => {
    camera.aspect = width.value / height.value;
    camera.updateProjectionMatrix();
    renderer.setSize(width.value, height.value);
  });
});
</script>

<template>
  <canvas :id />
</template>
