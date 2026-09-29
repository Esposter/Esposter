import type { ToonNodeMaterial } from "#src/nodes/ToonNodeMaterial";
import type { GrassOptions } from "#src/vegetation/GrassOptions";

import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { createWindNode } from "#src/nodes/createWindNode";
import { DoubleSide } from "three";
import {
  cameraViewMatrix,
  cos,
  float,
  hash,
  instanceIndex,
  mix,
  positionGeometry,
  sin,
  smoothstep,
  step,
  texture,
  varying,
  vec2,
  vec3,
  vec4,
} from "three/tsl";

// How green a ground colour must be, its green over its red and blue, for grass to grow on it rather than rock or sand
const MIN_GREENNESS = 0.05;
// How far a blade bends for a unit of wind, and how much it dips as it bends
const BEND_PER_WIND = 0.9;
// A grass ring's blades, generated in the vertex stage so no blade is stored. A blade's cell is its instance's
// Index in the ring's grid, centred on the camera and moving in whole cells so blades stay put in the world; a hash
// Of the cell jitters it, turns it, sizes it and decides whether the tier grows it. It stands on the ground
// Capture's height and takes its colour, and grows only on green ground above the water. The wind bends it by the
// Square of the height up it, and it fades in and out over its ring's distances. Every blade takes the ground's
// Upward normal, so a meadow toon-shades as one surface with light rolling across it, darker at the root
export const createGrassMaterial = ({
  bladeHeight,
  bladeWidth,
  cameraGround,
  density,
  groundCapture,
  lightUniforms,
  rampTexture,
  ring,
  waterUniforms,
  windUniforms,
}: GrassOptions): ToonNodeMaterial => {
  const grassMaterial = createToonMaterial({ isOutlined: false, lightUniforms, rampTexture });
  grassMaterial.emissiveNode = null;
  grassMaterial.side = DoubleSide;
  const { cellsPerSide, fadeEnd, fadeStart, innerRadius, scale, spacing } = ring;
  const index = float(instanceIndex);
  const row = index.div(cellsPerSide).floor();
  const column = index.sub(row.mul(cellsPerSide));
  const gridOrigin = cameraGround.div(spacing).floor().mul(spacing);
  const cell = vec2(column, row)
    .sub(cellsPerSide / 2)
    .mul(spacing)
    .add(gridOrigin);
  const seed = cell.x.mul(127.1).add(cell.y.mul(311.7));
  const ground = cell.add(
    vec2(hash(seed), hash(seed.add(1)))
      .sub(0.5)
      .mul(spacing),
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
  const greenness = captured.g.sub(captured.r.max(captured.b));
  const isGrown = isInsideCapture
    .mul(step(MIN_GREENNESS, greenness))
    .mul(step(waterUniforms.level, captured.a))
    .mul(step(hash(seed.add(2)), density));
  const distance = ground.distance(cameraGround);
  const fade = smoothstep(innerRadius, innerRadius + spacing * 4, distance).mul(
    float(1).sub(smoothstep(fadeStart, fadeEnd, distance)),
  );
  const size = hash(seed.add(3)).mul(0.5).add(0.75).mul(fade).mul(isGrown).mul(scale);
  const angle = hash(seed.add(4)).mul(Math.PI * 2);
  const across = positionGeometry.x.mul(bladeWidth).mul(size);
  const up = positionGeometry.y;
  const wind = createWindNode(windUniforms, ground).mul(BEND_PER_WIND).mul(up.mul(up));
  const bladeHeightNode = up.mul(bladeHeight).mul(size).sub(wind.length().mul(bladeHeight).mul(size).mul(0.3));
  grassMaterial.positionNode = vec3(
    ground.x.add(across.mul(cos(angle))).add(wind.x.mul(bladeHeight).mul(size)),
    captured.a.add(bladeHeightNode),
    ground.y.add(across.mul(sin(angle))).add(wind.y.mul(bladeHeight).mul(size)),
  );
  grassMaterial.normalNode = cameraViewMatrix.mul(vec4(0, 1, 0, 0)).xyz;
  const groundColor = varying(captured.rgb);
  grassMaterial.colorNode = mix(groundColor.mul(0.72), groundColor.mul(1.12).add(vec3(0.03, 0.03, 0)), up);
  return grassMaterial;
};
