<script setup lang="ts">
import countries from "@/assets/about/countries.json";
import data from "@/assets/about/data.json";
import { features } from "@/assets/about/globe.json";
import { ARC_STROKES, COLORS } from "@/services/visual/constants";
import { GlobeConfiguration } from "@/services/visual/GlobeConfiguration";
import { createRandomInteger } from "@/util/math/random/createRandomInteger";
import { getRandomValues } from "@/util/math/random/getRandomValues";
import { getResultAsync, noop, takeOne } from "@esposter/shared";
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
  isAtmosphereVisible,
  ringMaxRadius,
  rings,
  shininess,
} = GlobeConfiguration;
const id = "globe";
const getRandomColor = () => takeOne(COLORS, createRandomInteger(COLORS.length - 1));
const { width } = useWindowSize();
const height = computed(() => width.value);
// Teardown disposes what was actually built rather than a fixed list of names: the lazily imported chunk can
// Reject partway through the scene, and a hook reaching for a globe that was never assigned would throw before
// It ever got to the renderer
const disposables: { dispose: () => void }[] = [];
let animationFrameId: number;
let intervalId: number;

// The scene is built in one pass rather than inline in the hook, so the lazily imported `three-globe` chunk has
// Somewhere to report from: a stale chunk after a redeploy rejects, and a hook's callback is a slot nothing
// Awaits. The globe is decoration on the About page, so the page renders without it
const renderGlobe = async () => {
  const canvas = window.document.getElementById(id) as HTMLCanvasElement;
  const renderer = new WebGLRenderer({ antialias: true, canvas });
  disposables.push(renderer);
  renderer.setClearColor(0x000, 0);
  renderer.setSize(width.value, height.value);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const ambientLight = new AmbientLight(0xbbb, 0.3);
  disposables.push(ambientLight);
  scene.add(ambientLight);

  const camera = new PerspectiveCamera();
  camera.aspect = width.value / height.value;
  camera.updateProjectionMatrix();
  camera.position.z = 400;
  camera.position.x = 0;
  camera.position.y = 0;

  const directionLight = new DirectionalLight(0xfff, 0.8);
  disposables.push(directionLight);
  directionLight.position.set(-800, 2000, 400);
  camera.add(directionLight);

  const directionLight1 = new DirectionalLight(0x7982f6, 1);
  disposables.push(directionLight1);
  directionLight1.position.set(-200, 500, 200);
  camera.add(directionLight1);

  const pointLight = new PointLight(0x8566cc, 0.5);
  disposables.push(pointLight);
  pointLight.position.set(-200, 500, 200);
  camera.add(pointLight);

  scene.add(camera);
  scene.fog = new Fog(0x535ef3, 400, 2000);

  const controls = new OrbitControls(camera, canvas);
  disposables.push(controls);
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
  disposables.push(globeMaterial);
  const globe = new ThreeGlobe({ animateIn: true, waitForGlobeReady: true })
    .globeMaterial(globeMaterial)
    .hexPolygonsData(features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(isAtmosphereVisible)
    .atmosphereColor(atmosphereColor)
    .atmosphereAltitude(atmosphereAltitude)
    .hexPolygonColor(() => hexPolygonColor)
    .arcsData(data)
    .arcStartLat((d) => (d as Data).startLat)
    .arcStartLng((d) => (d as Data).startLng)
    .arcEndLat((d) => (d as Data).endLat)
    .arcEndLng((d) => (d as Data).endLng)
    .arcColor(() => getRandomColor())
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
    .pointColor(() => getRandomColor())
    .pointsMerge(true)
    .pointAltitude(0)
    .pointRadius(1)
    .ringsData(getRandomValues(countries, rings))
    .ringColor(() => getRandomColor())
    .ringMaxRadius(ringMaxRadius)
    .ringPropagationSpeed(3)
    .ringRepeatPeriod(arcTime * arcLength);
  globe.rotateY(-Math.PI * (5 / 9)).rotateZ(-Math.PI / 6);
  scene.add(globe);

  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    animationFrameId = window.requestAnimationFrame(animate);
  };
  animate();

  useEventListener("resize", () => {
    camera.aspect = width.value / height.value;
    camera.updateProjectionMatrix();
    renderer.setSize(width.value, height.value);
  });

  intervalId = window.setInterval(
    () => {
      globe.ringsData(getRandomValues(countries, rings));
    },
    Temporal.Duration.from({ seconds: 2 }).total("milliseconds"),
  );
};

onMounted(async () => {
  await getResultAsync(renderGlobe).match(noop, console.error);
});

onUnmounted(() => {
  window.cancelAnimationFrame(animationFrameId);
  window.clearInterval(intervalId);
  for (const disposable of disposables) disposable.dispose();
});
</script>

<template>
  <canvas :id />
</template>
