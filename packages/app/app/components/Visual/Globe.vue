<script setup lang="ts">
import type { MeshPhongMaterial } from "three";
import type { ArrayElement } from "type-fest/source/internal";

import { dayjs } from "#shared/services/dayjs";
import { createRandomInteger } from "#shared/util/math/random/createRandomInteger";
import countries from "@/assets/about/countries.json";
import data from "@/assets/about/data.json";
import { features } from "@/assets/about/globe.json";
import { ARC_STROKES, COLORS } from "@/services/visual/constants";
import { getRandomValues } from "@/util/math/random/getRandomValues";
import { AmbientLight, Color, DirectionalLight, Fog, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Data = ArrayElement<typeof data>;

const {
  arcLength,
  arcTime,
  atmosphereAltitude,
  atmosphereColor,
  emissive,
  emissiveIntensity,
  globeColor,
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
  emissive: "#220038",
  emissiveIntensity: 0.1,
  globeColor: "#3a228a",
  hexPolygonColor: "rgba(255,255,255,0.7)",
  ringMaxRadius: 3,
  rings: 3,
  shininess: 0.7,
  showAtmosphere: true,
};
const id = "globe";
const { width } = useWindowSize();
const height = computed(() => width.value);

onMounted(async () => {
  const canvas = document.querySelector<HTMLCanvasElement>(`#${id}`);
  if (!canvas) return;
  const renderer = new WebGLRenderer({ antialias: true, canvas });
  renderer.setClearColor(0x000, 0);
  renderer.setSize(width.value, height.value);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  scene.add(new AmbientLight(0xbbb, 0.3));

  const camera = new PerspectiveCamera();
  camera.aspect = width.value / height.value;
  camera.updateProjectionMatrix();
  camera.position.z = 400;
  camera.position.x = 0;
  camera.position.y = 0;

  const dLight = new DirectionalLight(0xfff, 0.8);
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
    .hexPolygonsData(features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(showAtmosphere)
    .atmosphereColor(atmosphereColor)
    .atmosphereAltitude(atmosphereAltitude)
    .hexPolygonColor(() => hexPolygonColor);
  globe.rotateY(-Math.PI * (5 / 9));
  globe.rotateZ(-Math.PI / 6);
  globe
    .arcsData(data)
    .arcStartLat((d) => (d as Data).startLat)
    .arcStartLng((d) => (d as Data).startLng)
    .arcEndLat((d) => (d as Data).endLat)
    .arcEndLng((d) => (d as Data).endLng)
    .arcColor(() => COLORS[createRandomInteger(COLORS.length - 1)])
    .arcAltitude((e) => (e as Data).arcAlt)
    .arcStroke(() => ARC_STROKES[createRandomInteger(ARC_STROKES.length - 1)])
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
    .pointColor(() => COLORS[createRandomInteger(COLORS.length - 1)])
    .pointsMerge(true)
    .pointAltitude(0)
    .pointRadius(1)
    .ringsData(getRandomValues(countries, rings))
    .ringColor(() => COLORS[createRandomInteger(COLORS.length - 1)])
    .ringMaxRadius(ringMaxRadius)
    .ringPropagationSpeed(3)
    .ringRepeatPeriod(arcTime * arcLength);

  const globeMaterial = globe.globeMaterial() as MeshPhongMaterial;
  globeMaterial.color = new Color(globeColor);
  globeMaterial.emissive = new Color(emissive);
  globeMaterial.emissiveIntensity = emissiveIntensity;
  globeMaterial.shininess = shininess;
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

  window.setInterval(() => {
    globe.ringsData(getRandomValues(countries, rings));
  }, dayjs.duration(2, "seconds").asMilliseconds());
});
</script>

<template>
  <canvas :id />
</template>
