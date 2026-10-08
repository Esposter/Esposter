import type { SplashMaterialOptions } from "#src/models/nodes/SplashMaterialOptions";

import {
  SPLASH_COUNT,
  SPLASH_LIFETIME,
  SPLASH_LIFT,
  SPLASH_OPACITY,
  SPLASH_RADIUS,
  SPLASH_SIZE,
} from "#src/atmosphere/constants";
import { DoubleSide } from "three";
import {
  float,
  hash,
  instanceIndex,
  max,
  positionGeometry,
  smoothstep,
  step,
  texture,
  time,
  varying,
  vec2,
  vec3,
} from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

// Where rain meets the ground: each splash a ring lying flat that widens and fades over its short life, then lands
// Somewhere new round the eye, its place a hash of its instance and its life's count, so no splash is stored. It stands
// On the ground capture's height, or on the water where the ground lies under it, and the share of them drawn is the
// Rain's, so snow and sand splash nothing. Like the streaks it takes the light's colour, dimming at night
export const createSplashMaterial = ({
  groundCapture,
  lightUniforms,
  precipitationUniforms,
  waterUniforms,
}: SplashMaterialOptions): MeshBasicNodeMaterial => {
  const { eye, splashDensity } = precipitationUniforms;
  const index = float(instanceIndex);
  const lifeTime = time.div(SPLASH_LIFETIME).add(hash(index.add(5)));
  const age = lifeTime.fract();
  const seed = index.add(lifeTime.floor().mul(SPLASH_COUNT)).mul(2);
  const ground = eye.xz.add(
    vec2(hash(seed), hash(seed.add(1)))
      .sub(0.5)
      .mul(SPLASH_RADIUS * 2),
  );
  const captureUV = vec2(
    ground.x.sub(groundCapture.center.x).div(groundCapture.size).add(0.5),
    float(0.5).sub(ground.y.sub(groundCapture.center.y).div(groundCapture.size)),
  );
  const captured = texture(groundCapture.renderTarget.texture, captureUV).level(float(0));
  const isInsideCapture = step(0, captureUV.x)
    .mul(step(captureUV.x, 1))
    .mul(step(0, captureUV.y))
    .mul(step(captureUV.y, 1));
  const isDrawn = isInsideCapture.mul(step(hash(index.add(6)), splashDensity));
  const size = age.mul(0.6).add(0.4).mul(SPLASH_SIZE).mul(isDrawn);
  const across = vec2(positionGeometry.x, positionGeometry.y.sub(0.5));
  const height = max(captured.a, waterUniforms.level).add(SPLASH_LIFT);
  const splashMaterial = new MeshBasicNodeMaterial({ depthWrite: false, side: DoubleSide, transparent: true });
  splashMaterial.positionNode = vec3(ground.x.add(across.x.mul(size)), height, ground.y.add(across.y.mul(size)));
  const radius = across.length().mul(2);
  const ring = smoothstep(0.55, 0.75, radius).mul(float(1).sub(smoothstep(0.8, 1, radius)));
  splashMaterial.colorNode = lightUniforms.lightColor;
  splashMaterial.opacityNode = ring.mul(float(1).sub(varying(age))).mul(SPLASH_OPACITY);
  return splashMaterial;
};
