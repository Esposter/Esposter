import type { FluidResources } from "#src/models/visual/FluidResources";
import type { RenderTarget } from "three/webgpu";

import waterNormalsUrl from "#src/assets/visual/textures/waternormals.jpg";
import { getResultAsync } from "@esposter/shared";
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

// The page's own region, which the shell sizes to the viewport past the dock
const getSize = ({ clientHeight, clientWidth }: HTMLElement) => ({ height: clientHeight, width: clientWidth });

const disposeFluidResources = async (resources: FluidResources) => {
  const {
    box,
    controls,
    disposeRenderTarget,
    inspector,
    pmremGenerator,
    renderer,
    renderPipeline,
    sky,
    stopResize,
    water,
  } = resources;
  stopResize();
  // Waits for an init still under way. A refused init never started the renderer, so it has no loop to stop and
  // Nothing else to dispose. The refusal was already raised by the setup that awaited it, so it is read here as a
  // Boolean only
  const isInitialized = await getResultAsync(() => renderer.init()).match(
    () => true,
    () => false,
  );
  if (isInitialized) await renderer.setAnimationLoop(null);
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
  // An initialised renderer disposes the inspector it holds, so the inspector is disposed here only without it
  if (isInitialized) await renderer.dispose();
  else inspector.dispose();
  renderer.domElement.remove();
};

export const useFluidSimulator = (container: MaybeRefOrGetter<HTMLElement | undefined>) => {
  const parameters = { azimuth: 180, elevation: 2, exposure: 0.5 };
  // Assigned as soon as every resource exists, before the renderer's init is awaited, so an unmount at any later
  // Point releases what the setup has built, whether the init settles or is refused
  let fluidResources: FluidResources | undefined;
  // Set by an unmount, which the awaits check so that the setup builds nothing the unmount has already passed
  let isUnmounted = false;
  onMounted(async () => {
    const containerValue = toValue(container);
    if (!containerValue) return;
    /* oxlint-disable-next-line selector-ban/no-restricted-syntax -- the Inspector is the renderer's debug overlay,
       loaded only once the simulator mounts so it stays out of the server and eager graphs */
    const { Inspector } = await import("three/examples/jsm/inspector/Inspector.js");
    // An unmount during the import found no resources to release, so nothing is built after it
    if (isUnmounted) return;

    const renderer = new WebGPURenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    const { height, width } = getSize(containerValue);
    renderer.setSize(width, height);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = parameters.exposure;
    const inspector = new Inspector();
    containerValue.append(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(55, width / height, 1, 20_000);
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
    const waterGeometry = new PlaneGeometry(10_000, 10_000);
    const textureLoader = new TextureLoader();
    const waterNormals = textureLoader.load(waterNormalsUrl);
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
    sky.scale.setScalar(10_000);
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

    // Registered outside the synchronous setup scope, so it is not auto-disposed. Its stop handle travels in the
    // Resources
    const stopResize = useEventListener("resize", () => {
      const { height: newHeight, width: newWidth } = getSize(containerValue);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });

    const render = () => {
      const time = performance.now() * 0.001;
      box.position.y = Math.sin(time) * 20 + 5;
      box.rotation.x = time * 0.5;
      box.rotation.z = time * 0.51;
      renderPipeline.render();
    };

    fluidResources = {
      box,
      controls,
      disposeRenderTarget: () => renderTarget?.dispose(),
      inspector,
      pmremGenerator,
      renderer,
      renderPipeline,
      sky,
      stopResize,
      water,
    };
    await renderer.init();
    // Attached only once the renderer is up: the inspector's own init awaits the renderer's, and attached before a
    // Refused init, that await's rejection would go unhandled. Attached before the unmount check, so a renderer the
    // Unmount released disposes the inspector it holds
    renderer.inspector = inspector;
    // The unmount has already released what exists, and waited for this init to settle, so nothing more is set up
    if (isUnmounted) return;

    updateSun();

    const gui = inspector.createParameters("Settings");
    // Creating parameters opens their panel, which starts closed behind its button instead
    inspector.hide();
    const folderSky = gui.addFolder("Sky");
    folderSky.add(parameters, "elevation", 0, 90, 0.1).onChange(() => {
      updateSun();
    });
    folderSky.add(parameters, "azimuth", -180, 180, 0.1).onChange(() => {
      updateSun();
    });
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

    await renderer.setAnimationLoop(() => {
      render();
    });
  });
  onUnmounted(async () => {
    isUnmounted = true;
    if (fluidResources) await disposeFluidResources(fluidResources);
  });
};
