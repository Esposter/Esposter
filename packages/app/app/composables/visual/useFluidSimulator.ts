import type { RenderTarget } from "three/webgpu";

import { APP_BAR_HEIGHT } from "#shared/services/app/constants";
import { WATERS_NORMALS_TEXTURE_PATH } from "@/services/visual/constants";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SkyMesh } from "three/examples/jsm/objects/SkyMesh.js";
import { WaterMesh } from "three/examples/jsm/objects/WaterMesh.js";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { pass } from "three/tsl";
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RenderPipeline,
  RepeatWrapping,
  Scene,
  TextureLoader,
  Vector3,
  WebGPURenderer,
} from "three/webgpu";

// Everything the teardown must dispose, assembled only after onMounted finishes wiring three.js
interface FluidResources {
  box: Mesh<BoxGeometry, MeshStandardMaterial>;
  controls: OrbitControls;
  disposeRenderTarget: () => void;
  pmremGenerator: PMREMGenerator;
  renderer: WebGPURenderer;
  renderPipeline: RenderPipeline;
  sky: SkyMesh;
  stopResize: () => void;
  water: WaterMesh;
}

export const useFluidSimulator = (container: MaybeRefOrGetter<HTMLElement | undefined>) => {
  const parameters = { azimuth: 180, elevation: 2, exposure: 0.5 };
  // Assigned only at the tail of onMounted (past every await), so an unmount that races setup leaves this
  // undefined and teardown no-ops instead of dereferencing a handle that was never created
  let fluidResources: FluidResources | undefined;
  const getHeight = () => window.innerHeight - APP_BAR_HEIGHT;

  onMounted(async () => {
    const containerValue = toValue(container);
    if (!containerValue) return;
    const { Inspector } = await import("three/examples/jsm/inspector/Inspector.js");
    const renderer = new WebGPURenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, getHeight());
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = parameters.exposure;
    const inspector = new Inspector();
    renderer.inspector = inspector;
    containerValue.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(55, window.innerWidth / getHeight(), 1, 20000);
    camera.position.set(30, 30, 100);

    const renderPipeline = new RenderPipeline(renderer);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode("output");
    const bloomPass = bloom(scenePassColor);
    bloomPass.threshold.value = 0;
    bloomPass.strength.value = 0.1;
    bloomPass.radius.value = 0;
    renderPipeline.outputNode = scenePassColor.add(bloomPass);

    const sun = new Vector3();
    const waterGeometry = new PlaneGeometry(10000, 10000);
    const textureLoader = new TextureLoader();
    const waterNormals = textureLoader.load(WATERS_NORMALS_TEXTURE_PATH);
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
    sky.cloudCoverage.value = 0.4;
    sky.cloudDensity.value = 0.5;
    sky.cloudElevation.value = 0.5;

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

    const boxGeometry = new BoxGeometry(30, 30, 30);
    const boxMaterial = new MeshStandardMaterial({ roughness: 0 });
    const box = new Mesh(boxGeometry, boxMaterial);
    scene.add(box);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40;
    controls.maxDistance = 200;
    controls.update();

    const gui = inspector.createParameters("Settings");
    const folderSky = gui.addFolder("Sky");
    folderSky.add(parameters, "elevation", 0, 90, 0.1).onChange(updateSun);
    folderSky.add(parameters, "azimuth", -180, 180, 0.1).onChange(updateSun);
    folderSky.add(parameters, "exposure", 0, 1, 0.0001).onChange((value: number) => {
      renderer.toneMappingExposure = value;
    });
    const folderWater = gui.addFolder("Water");
    folderWater.add(water.distortionScale, "value", 0, 8, 0.1).name("distortionScale");
    folderWater.add(water.size, "value", 0.1, 10, 0.1).name("size");
    const folderBloom = gui.addFolder("Bloom");
    folderBloom.add(bloomPass.strength, "value", 0, 3, 0.01).name("strength");
    folderBloom.add(bloomPass.radius, "value", 0, 1, 0.01).name("radius");
    const folderClouds = gui.addFolder("Clouds");
    folderClouds.add(sky.cloudCoverage, "value", 0, 1, 0.01).name("coverage");
    folderClouds.add(sky.cloudDensity, "value", 0, 1, 0.01).name("density");
    folderClouds.add(sky.cloudElevation, "value", 0, 1, 0.01).name("elevation");

    // Registered after awaits, so it is outside the synchronous setup scope and won't auto-dispose —
    // its stop handle travels in the resources so teardown can detach it
    const stopResize = useEventListener("resize", () => {
      camera.aspect = window.innerWidth / getHeight();
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, getHeight());
    });

    const render = () => {
      const time = performance.now() * 0.001;
      box.position.y = Math.sin(time) * 20 + 5;
      box.rotation.x = time * 0.5;
      box.rotation.z = time * 0.51;
      renderPipeline.render();
    };

    await renderer.setAnimationLoop(render);

    fluidResources = {
      box,
      controls,
      disposeRenderTarget: () => renderTarget?.dispose(),
      pmremGenerator,
      renderer,
      renderPipeline,
      sky,
      stopResize,
      water,
    };
  });

  // Idempotent, undefined-safe teardown: an early unmount (before or between the onMounted awaits) leaves
  // fluidResources undefined, so nothing is dereferenced; clearing it first makes a repeat call a no-op
  onUnmounted(async () => {
    if (!fluidResources) return;

    const { box, controls, disposeRenderTarget, pmremGenerator, renderer, renderPipeline, sky, stopResize, water } =
      fluidResources;
    fluidResources = undefined;
    stopResize();
    await renderer.setAnimationLoop(null);
    renderPipeline.dispose();
    water.geometry.dispose();
    water.material.dispose();
    water.waterNormals.dispose();
    sky.geometry.dispose();
    sky.material.dispose();
    box.geometry.dispose();
    box.material.dispose();
    pmremGenerator.dispose();
    disposeRenderTarget();
    controls.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  });
};
