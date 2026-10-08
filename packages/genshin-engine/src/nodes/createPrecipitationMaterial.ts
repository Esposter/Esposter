import type { PrecipitationMaterialOptions } from "#src/models/nodes/PrecipitationMaterialOptions";

import {
  PRECIPITATION_SWAY_SPEED,
  PRECIPITATION_VOLUME_HEIGHT,
  PRECIPITATION_VOLUME_SIZE,
} from "#src/atmosphere/constants";
import { DoubleSide } from "three";
import { MeshBasicNodeMaterial } from "three/webgpu";
import {
  cross,
  cos,
  float,
  hash,
  instanceIndex,
  mod,
  normalize,
  positionGeometry,
  sin,
  step,
  time,
  vec3,
} from "three/tsl";

const TAU = Math.PI * 2;
const VOLUME_SPAN = vec3(PRECIPITATION_VOLUME_SIZE, PRECIPITATION_VOLUME_HEIGHT, PRECIPITATION_VOLUME_SIZE);
// The particles, each a streak trailing behind its fall and turned to face the eye. A particle's base is a hash of its
// Instance's index, and it falls on the wind's drift over its fall speed, wrapped in a box the eye stands in the middle
// Of, so the particles stay put in the world and the box never empties. The share drawn is the density the hash passes,
// And a particle the density misses collapses to nothing. Sway moves it side to side, and the streak takes the light's
// Colour, so it dims at night with the sky
export const createPrecipitationMaterial = ({
  lightUniforms,
  precipitationUniforms,
  windUniforms,
}: PrecipitationMaterialOptions): MeshBasicNodeMaterial => {
  const { density, eye, fallSpeed, length, opacity, sway, width, windDrift } = precipitationUniforms;
  const index = float(instanceIndex);
  const base = vec3(hash(index), hash(index.add(1)), hash(index.add(2))).mul(VOLUME_SPAN);
  const isDrawn = step(hash(index.add(3)), density);
  const drift = windUniforms.direction.mul(windUniforms.strength).mul(windDrift);
  const velocity = vec3(drift.x, fallSpeed.mul(-1), drift.y);
  const offset = base.add(velocity.mul(time)).sub(eye).add(VOLUME_SPAN.div(2));
  const wrapped = mod(offset, VOLUME_SPAN).sub(VOLUME_SPAN.div(2));
  const swayPhase = time.mul(PRECIPITATION_SWAY_SPEED).add(hash(index.add(4)).mul(TAU));
  const swayOffset = vec3(sin(swayPhase), 0, cos(swayPhase)).mul(sway);
  const center = eye.add(wrapped).add(swayOffset);
  const axis = normalize(velocity);
  const right = normalize(cross(axis, eye.sub(center)));
  const streak = right
    .mul(positionGeometry.x.mul(width))
    .add(axis.mul(-1).mul(positionGeometry.y.mul(length)))
    .mul(isDrawn);
  const precipitationMaterial = new MeshBasicNodeMaterial({ depthWrite: false, side: DoubleSide, transparent: true });
  precipitationMaterial.colorNode = lightUniforms.lightColor;
  precipitationMaterial.opacityNode = opacity.mul(isDrawn);
  precipitationMaterial.positionNode = center.add(streak);
  return precipitationMaterial;
};
