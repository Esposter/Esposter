import type { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import type { GrassOptions } from "#src/models/vegetation/GrassOptions";

import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { createWetDarkeningNode } from "#src/nodes/createWetDarkeningNode";
import { createWetSheenNode } from "#src/nodes/createWetSheenNode";
import { createGrassBladePoint } from "#src/vegetation/createGrassBladePoint";
import { createGrassCell } from "#src/vegetation/createGrassCell";
import { DoubleSide } from "three";
import { cameraViewMatrix, cos, mix, positionGeometry, sin, varying, vec2, vec3, vec4 } from "three/tsl";

// A grass ring's blades, generated in the vertex stage so no blade is stored. A blade's cell is its instance's cell as
// the culling pass kept it, and the cell itself gives the blade its place, jitter, turn, size and whether it grows at all
// (`createGrassCell`). The wind and the grass trail bend its points (`createGrassBladePoint`). It takes the ground's
// upward normal, so a meadow toon-shades as one surface with light rolling across it, darker at the root. A wet meadow
// darkens and takes the sun's glint as the ground does, and no rim
export const createGrassMaterial = ({
  bladeHeight,
  bladeWidth,
  cameraGround,
  cellIndex,
  density,
  groundCapture,
  grassTrail,
  lightUniforms,
  rampTexture,
  ring,
  waterUniforms,
  windUniforms,
}: GrassOptions): ToonNodeMaterial => {
  const grassMaterial = createToonMaterial({ isOutlined: false, lightUniforms, rampTexture });
  grassMaterial.emissiveNode = createWetSheenNode(lightUniforms);
  grassMaterial.side = DoubleSide;
  const { angle, captured, ground, size } = createGrassCell({
    cameraGround,
    density,
    groundCapture,
    index: cellIndex,
    ring,
    waterUniforms,
  });
  const up = positionGeometry.y;
  grassMaterial.positionNode = createGrassBladePoint({
    bladeHeight,
    captured,
    ground,
    grassTrail,
    offset: vec2(cos(angle), sin(angle)).mul(positionGeometry.x.mul(bladeWidth).mul(size)),
    size,
    up,
    windUniforms,
  });
  grassMaterial.normalNode = cameraViewMatrix.mul(vec4(0, 1, 0, 0)).xyz;
  const groundColor = varying(captured.rgb);
  grassMaterial.colorNode = mix(groundColor.mul(0.72), groundColor.mul(1.12).add(vec3(0.03, 0.03, 0)), up).mul(
    createWetDarkeningNode(lightUniforms),
  );
  return grassMaterial;
};
