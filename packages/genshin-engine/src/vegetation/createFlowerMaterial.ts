import type { ToonMaterialOptions } from "#src/models/nodes/ToonMaterialOptions";
import type { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import type { WindUniforms } from "#src/models/wind/WindUniforms";

import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { createWindNode } from "#src/nodes/createWindNode";
import { FLOWER_BEND_PER_WIND } from "#src/vegetation/constants";
import { DoubleSide } from "three";
import {
  cameraViewMatrix,
  modelWorldMatrix,
  positionGeometry,
  positionLocal,
  step,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";

const FLOWER_ALPHA_TEST = 0.5;
// The flower's head, a disc toward the top of each card, the stem below it left to the grass round it
const HEAD_CENTER = vec2(0.5, 0.7);
const HEAD_RADIUS = 0.28;
// The scattered flowers, white in themselves so each instance's colour is its own, cut to a head on each crossed card.
// Like a grass blade, each takes the ground's upward normal so it shades with the field it stands in, and the wind
// Bends it by the square of the height up it, so it sways with the grass round it
export const createFlowerMaterial = (
  toonMaterialOptions: Pick<ToonMaterialOptions, "lightUniforms" | "rampTexture">,
  windUniforms: WindUniforms,
): ToonNodeMaterial => {
  const flowerMaterial = createToonMaterial({ ...toonMaterialOptions, color: 0xffffff, isOutlined: false });
  flowerMaterial.side = DoubleSide;
  flowerMaterial.opacityNode = step(uv().sub(HEAD_CENTER).length(), HEAD_RADIUS);
  flowerMaterial.alphaTest = FLOWER_ALPHA_TEST;
  const worldPosition = modelWorldMatrix.mul(vec4(positionLocal, 1)).xyz;
  const bend = createWindNode(windUniforms, worldPosition.xz)
    .mul(FLOWER_BEND_PER_WIND)
    .mul(positionGeometry.y.mul(positionGeometry.y));
  flowerMaterial.positionNode = positionLocal.add(vec3(bend.x, 0, bend.y));
  flowerMaterial.normalNode = cameraViewMatrix.mul(vec4(0, 1, 0, 0)).xyz;
  return flowerMaterial;
};
