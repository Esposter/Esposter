import type { GlobeArc } from "@/models/visual/GlobeArc";
import type { LandMask } from "@/models/visual/LandMask";

import arcs from "@/assets/about/data.json";
import landMaskJson from "@/assets/about/generated/globeLandMask/landMask.json";
import countries from "@/assets/about/countries.json";
import { GlobeConfiguration } from "@/services/visual/GlobeConfiguration";
import { ARC_STROKES, COLORS } from "@/services/visual/constants";
import { createArcCurve } from "@/services/visual/globe/createArcCurve";
import { createLandDots } from "@/services/visual/globe/createLandDots";
import { getArcState } from "@/services/visual/globe/getArcState";
import { getStartRotationY } from "@/services/visual/globe/getStartRotationY";
import { latLngToVector3 } from "@/services/visual/globe/latLngToVector3";
import { createRandomInteger } from "@/util/math/random/createRandomInteger";
import { takeOne } from "@esposter/shared";
import {
  AmbientLight,
  BackSide,
  CircleGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const landMask: LandMask = landMaskJson;
const {
  atmosphereColor,
  atmosphereScale,
  color,
  dotColor,
  dotOpacity,
  dotRadius,
  emissive,
  emissiveIntensity,
  fogColor,
  oblique,
  pulseMaxRadius,
  qualityTiers,
  radius,
  shininess,
  spacing,
  tubeRadialSegments,
  tubeSegments,
} = GlobeConfiguration;
const STILL_ARC_STATE = { end: 1, pulseOpacity: 0, pulseScale: 0, start: 0 } as const;
// Just above the sphere, so a dot or a ring never sinks into it
const SURFACE_RADIUS = radius * 1.002;
const getRandomColor = () => takeOne(COLORS, createRandomInteger(COLORS.length - 1));

// A rim of colour on the side of the sphere facing away from the camera: the cheapest edge there is, which is what lets
// The renderer leave antialiasing off. It fades by alpha rather than adding light, so it reads the same over a light page
// And a dark one
const createHalo = () =>
  new Mesh(
    new SphereGeometry(radius * atmosphereScale, 48, 48),
    new ShaderMaterial({
      fragmentShader: `
        uniform vec3 color;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(max(0.0, 0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
          gl_FragColor = vec4(color, clamp(intensity, 0.0, 1.0));
        }
      `,
      side: BackSide,
      transparent: true,
      uniforms: { color: { value: new Color(atmosphereColor) } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
    }),
  );

const placeOnSurface = (object: Object3D, lat: number, lng: number) => {
  object.position.copy(latLngToVector3(lat, lng, SURFACE_RADIUS));
  object.lookAt(object.position.clone().multiplyScalar(2));
  object.updateMatrix();
};

// Everything the globe draws, built on three alone. It owns no loop and no size of its own: the caller says when to
// Draw, and how wide
export const createGlobeScene = (canvas: HTMLCanvasElement, initialWidth: number) => {
  const renderer = new WebGLRenderer({ alpha: true, antialias: false, canvas });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(initialWidth, initialWidth, false);

  const scene = new Scene();
  scene.fog = new Fog(fogColor, 400, 2000);
  const camera = new PerspectiveCamera();
  camera.position.z = 400;
  const ambientLight = new AmbientLight(0xbbbbbb, 0.3);
  const whiteLight = new DirectionalLight(0xffffff, 0.8);
  whiteLight.position.set(-800, 2000, 400);
  const blueLight = new DirectionalLight(0x7982f6, 1);
  blueLight.position.set(-200, 500, 200);
  const violetLight = new PointLight(0x8566cc, 0.5);
  violetLight.position.set(-200, 500, 200);
  // The lights ride on the camera, so the lit side of the globe stays towards the reader as it is dragged round
  camera.add(whiteLight, blueLight, violetLight);
  scene.add(ambientLight, camera);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 300;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  const tilt = new Group();
  tilt.rotation.z = oblique;
  const globe = new Group();
  globe.rotation.y = getStartRotationY(new Date().getTimezoneOffset());
  tilt.add(globe);
  scene.add(tilt);

  const sphere = new Mesh(
    new SphereGeometry(radius, 64, 64),
    new MeshPhongMaterial({ color, emissive, emissiveIntensity, shininess }),
  );
  const halo = createHalo();
  globe.add(sphere, halo);

  const dotMaterial = new MeshBasicMaterial({
    color: dotColor,
    opacity: dotOpacity,
    side: DoubleSide,
    transparent: true,
  });
  let dots: InstancedMesh | undefined;
  const setQualityTier = (tier: number) => {
    const { densityScale, pixelRatio } = takeOne(qualityTiers, tier);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatio));
    if (dots) {
      globe.remove(dots);
      dots.geometry.dispose();
      dots.dispose();
    }
    // Spacing grows with the square root of the density it gives up, so a dot widens as its neighbours thin out
    const scale = 1 / Math.sqrt(densityScale);
    const positions = createLandDots(landMask, spacing * scale);
    dots = new InstancedMesh(new CircleGeometry(dotRadius * scale, 5), dotMaterial, positions.length);
    const dummy = new Object3D();
    for (const [index, { lat, lng }] of positions.entries()) {
      placeOnSurface(dummy, lat, lng);
      dots.setMatrixAt(index, dummy.matrix);
    }
    dots.instanceMatrix.needsUpdate = true;
    globe.add(dots);
  };
  setQualityTier(0);

  const pointMaterial = new MeshBasicMaterial({ side: DoubleSide });
  const points = new InstancedMesh(new CircleGeometry(0.9, 8), pointMaterial, countries.length);
  const pointDummy = new Object3D();
  for (const [index, { lat, lng }] of countries.entries()) {
    placeOnSurface(pointDummy, lat, lng);
    points.setMatrixAt(index, pointDummy.matrix);
    points.setColorAt(index, new Color(getRandomColor()));
  }
  globe.add(points);

  const arcMeshes = (arcs as GlobeArc[]).map((arc) => {
    const arcColor = getRandomColor();
    const stroke = takeOne(ARC_STROKES, createRandomInteger(ARC_STROKES.length - 1));
    const tube = new Mesh(
      new TubeGeometry(
        createArcCurve(arc, radius),
        tubeSegments,
        (stroke * radius * Math.PI) / 180,
        tubeRadialSegments,
      ),
      new MeshBasicMaterial({ color: arcColor }),
    );
    const ring = new Mesh(
      new RingGeometry(0.7, 1, 24),
      new MeshBasicMaterial({ color: arcColor, depthWrite: false, side: DoubleSide, transparent: true }),
    );
    placeOnSurface(ring, arc.endLat, arc.endLng);
    globe.add(tube, ring);
    return { order: arc.order, ring, tube };
  });
  const indicesPerSegment = tubeRadialSegments * 6;

  // Drawing never touches the controls: their update fires the change event, and a still globe draws on that event
  const draw = (elapsed: number, isStill: boolean) => {
    for (const { order, ring, tube } of arcMeshes) {
      const { end, pulseOpacity, pulseScale, start } = isStill ? STILL_ARC_STATE : getArcState(elapsed, order);
      const startIndex = Math.floor(start * tubeSegments) * indicesPerSegment;
      const endIndex = Math.ceil(end * tubeSegments) * indicesPerSegment;
      tube.geometry.setDrawRange(startIndex, Math.max(0, endIndex - startIndex));
      ring.visible = pulseOpacity > 0;
      ring.scale.setScalar(Math.max(1e-4, pulseScale * pulseMaxRadius));
      (ring.material as MeshBasicMaterial).opacity = pulseOpacity;
    }
    renderer.render(scene, camera);
  };

  const render = (elapsed: number) => {
    controls.update();
    draw(elapsed, false);
  };

  const setSize = (width: number) => {
    renderer.setSize(width, width, false);
  };

  const dispose = () => {
    controls.dispose();
    for (const { ring, tube } of arcMeshes) {
      tube.geometry.dispose();
      (tube.material as MeshBasicMaterial).dispose();
      ring.geometry.dispose();
      (ring.material as MeshBasicMaterial).dispose();
    }
    dots?.geometry.dispose();
    dots?.dispose();
    dotMaterial.dispose();
    points.geometry.dispose();
    points.dispose();
    pointMaterial.dispose();
    halo.geometry.dispose();
    (halo.material as ShaderMaterial).dispose();
    sphere.geometry.dispose();
    (sphere.material as MeshPhongMaterial).dispose();
    renderer.dispose();
  };

  return { controls, dispose, draw, render, setQualityTier, setSize };
};
