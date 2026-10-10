import type { ToonMaterialOptions } from "#src/models/nodes/ToonMaterialOptions";
import type { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import type { WindUniforms } from "#src/models/wind/WindUniforms";

import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { createWetDarkeningNode } from "#src/nodes/createWetDarkeningNode";
import { createWindNode } from "#src/nodes/createWindNode";
import {
  FLOWER_BEND_PER_WIND,
  FLOWER_COLOR_ATTRIBUTE_NAME,
  FLOWER_MATRIX_ATTRIBUTE_NAMES,
} from "#src/vegetation/constants";
import { DoubleSide } from "three";
import {
  attribute,
  cameraViewMatrix,
  mat4,
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
// The scattered flowers, each instance placed and coloured by its tile's per-instance attributes
// (`createFlowerTileGeometry`), so every tile's flowers share this one material, cut to a head on each crossed card.
// Like a grass blade, each takes the ground's upward normal so it shades with the field it stands in, and the wind
// Bends it by the square of the height up it, so it sways with the grass round it
export const createFlowerMaterial = (
  toonMaterialOptions: Pick<ToonMaterialOptions, "lightUniforms" | "rampTexture">,
  windUniforms: WindUniforms,
): ToonNodeMaterial => {
  const flowerMaterial = createToonMaterial({ ...toonMaterialOptions, isOutlined: false });
  flowerMaterial.side = DoubleSide;
  flowerMaterial.opacityNode = step(uv().sub(HEAD_CENTER).length(), HEAD_RADIUS);
  flowerMaterial.alphaTest = FLOWER_ALPHA_TEST;
  flowerMaterial.colorNode = attribute(FLOWER_COLOR_ATTRIBUTE_NAME, "vec3").mul(
    createWetDarkeningNode(toonMaterialOptions.lightUniforms),
  );
  const [column0, column1, column2, column3] = FLOWER_MATRIX_ATTRIBUTE_NAMES;
  const instanceMatrix = mat4(
    attribute(column0, "vec4"),
    attribute(column1, "vec4"),
    attribute(column2, "vec4"),
    attribute(column3, "vec4"),
  );
  const placedPosition = instanceMatrix.mul(vec4(positionLocal, 1)).xyz;
  const worldPosition = modelWorldMatrix.mul(vec4(placedPosition, 1)).xyz;
  const bend = createWindNode(windUniforms, worldPosition.xz)
    .mul(FLOWER_BEND_PER_WIND)
    .mul(positionGeometry.y.mul(positionGeometry.y));
  flowerMaterial.positionNode = placedPosition.add(vec3(bend.x, 0, bend.y));
  flowerMaterial.normalNode = cameraViewMatrix.mul(vec4(0, 1, 0, 0)).xyz;
  return flowerMaterial;
};
