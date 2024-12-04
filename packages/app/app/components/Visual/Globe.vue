<script setup lang="ts">
import type { MeshPhongMaterial } from "three";
import type { ArrayElement } from "type-fest/source/internal";

import { dayjs } from "#shared/services/dayjs";
import airportHistory from "@/assets/about/airport-history.json";
import flightHistory from "@/assets/about/flight-history.json";
import countries from "@/assets/about/globe-data-min.json";
import { AmbientLight, Color, DirectionalLight, Fog, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Airport = ArrayElement<(typeof airportHistory)["airports"]>;

interface FeatureCollection {
  properties: Record<string, string>;
}

type Flight = ArrayElement<(typeof flightHistory)["flights"]>;

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
    .hexPolygonColor((e) => {
      if (["IDN", "KAZ", "KGZ", "KOR", "MYS", "RUS", "THA", "UZB"].includes((e as FeatureCollection).properties.ISO_A3))
        return "rgba(255,255,255, 1)";
      else return "rgba(255,255,255, 0.7)";
    });
  globe.rotateY(-Math.PI * (5 / 9));
  globe.rotateZ(-Math.PI / 6);

  setTimeout(() => {
    globe
      .arcsData(flightHistory.flights)
      .arcColor((e: unknown) => ((e as Flight).status ? "#9cff00" : "#ff4000"))
      .arcAltitude((e) => (e as Flight).arcAlt)
      .arcStroke((e) => ((e as Flight).status ? 0.5 : 0.3))
      .arcDashLength(0.9)
      .arcDashGap(4)
      .arcDashAnimateTime(dayjs.duration(1, "second").asMilliseconds())
      .arcsTransitionDuration(dayjs.duration(1, "second").asMilliseconds())
      .arcDashInitialGap((e) => (e as Flight).order * 1)
      .labelsData(airportHistory.airports)
      .labelColor(() => "#ffcb21")
      .labelDotOrientation((e) => ((e as Airport).text === "ALA" ? "top" : "right"))
      .labelDotRadius(0.3)
      .labelSize((e) => (e as Airport).size)
      .labelText("city")
      .labelResolution(6)
      .labelAltitude(0.01)
      .pointsData(airportHistory.airports)
      .pointColor(() => "#fff")
      .pointsMerge(true)
      .pointAltitude(0.07)
      .pointRadius(0.05);
  }, dayjs.duration(1, "second").asMilliseconds());

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
