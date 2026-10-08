import type { FactoryOptions } from "#src/models/kits/snezhnaya/FactoryOptions";
import type { BufferGeometry } from "three";

import { createBoxesGeometry } from "#src/kits/architecture/createBoxesGeometry";
import { createLatheStackGeometry } from "#src/kits/architecture/createLatheStackGeometry";
import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";

const CHIMNEY_RADIAL_SEGMENTS = 12;
// The chimney stands at this share of the hall's width from its centre
const CHIMNEY_OFFSET_RATIO = 0.3;
// The industrial kit's hall and chimney as one geometry for one material, the hall's base on the origin
export const createFactoryGeometry = ({
  chimneyHeight,
  chimneyRadius,
  depth,
  height,
  width,
}: FactoryOptions): BufferGeometry => {
  const hall = createBoxesGeometry([[-width / 2, 0, -depth / 2, width / 2, height, depth / 2]]);
  const chimney = createLatheStackGeometry({
    isFaceted: false,
    radialSegments: CHIMNEY_RADIAL_SEGMENTS,
    sections: [{ bottomRadius: chimneyRadius, height: chimneyHeight, topRadius: chimneyRadius }],
  }).translate(width * CHIMNEY_OFFSET_RATIO, height, 0);
  return mergeGeometryParts([hall, chimney]);
};
