import type { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import type { GrassOptions } from "#src/models/vegetation/GrassOptions";

import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { createWetDarkeningNode } from "#src/nodes/createWetDarkeningNode";
import { createWetSheenNode } from "#src/nodes/createWetSheenNode";
import { createWindNode } from "#src/nodes/createWindNode";
import { sampleGrassTrail } from "#src/nodes/sampleGrassTrail";
import { createGrassCell } from "#src/vegetation/createGrassCell";
import { GRASS_TRAIL_BEND_SHARE } from "#src/vegetation/constants";
import { DoubleSide } from "three";
import { cameraViewMatrix, cos, mix, positionGeometry, sin, varying, vec3, vec4 } from "three/tsl";

// How far a blade bends for a unit of wind, and how much it dips as it bends
const BEND_PER_WIND = 0.9;
// How far the top of a blade dips for each metre it bends, as a share of its height
const DIP_PER_BEND = 0.3;
// A grass ring's blades, generated in the vertex stage so no blade is stored. A blade's cell is its instance's cell as
// the culling pass kept it, and the cell itself gives the blade its place, jitter, turn, size and whether it grows at all
// (`createGrassCell`). The wind bends it by the square of the height up it, and the grass trail bends it away from
// where the character has walked, where the trail is. It takes the ground's upward normal, so a meadow toon-shades as one
// surface with light rolling across it, darker at the root. A wet meadow darkens and takes the sun's glint as the ground
// does, and no rim
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
  const across = positionGeometry.x.mul(bladeWidth).mul(size);
  const up = positionGeometry.y;
  const wind = createWindNode(windUniforms, ground).mul(BEND_PER_WIND).mul(up.mul(up));
  const trailBend = sampleGrassTrail(grassTrail, ground).mul(GRASS_TRAIL_BEND_SHARE).mul(up.mul(up));
  const trailOffset = trailBend.mul(bladeHeight).mul(size);
  const bladeHeightNode = up
    .mul(bladeHeight)
    .mul(size)
    .sub(wind.length().mul(bladeHeight).mul(size).mul(DIP_PER_BEND))
    .sub(trailBend.length().mul(bladeHeight).mul(size).mul(DIP_PER_BEND));
  grassMaterial.positionNode = vec3(
    ground.x
      .add(across.mul(cos(angle)))
      .add(wind.x.mul(bladeHeight).mul(size))
      .add(trailOffset.x),
    captured.a.add(bladeHeightNode),
    ground.y
      .add(across.mul(sin(angle)))
      .add(wind.y.mul(bladeHeight).mul(size))
      .add(trailOffset.y),
  );
  grassMaterial.normalNode = cameraViewMatrix.mul(vec4(0, 1, 0, 0)).xyz;
  const groundColor = varying(captured.rgb);
  grassMaterial.colorNode = mix(groundColor.mul(0.72), groundColor.mul(1.12).add(vec3(0.03, 0.03, 0)), up).mul(
    createWetDarkeningNode(lightUniforms),
  );
  return grassMaterial;
};
