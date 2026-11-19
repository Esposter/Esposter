import type { PropOutline } from "#src/models/kits/props/PropOutline";
import type { BufferGeometry } from "three";

import { createBoxesGeometry } from "#src/kits/architecture/createBoxesGeometry";
import { createLatheStackGeometry } from "#src/kits/architecture/createLatheStackGeometry";

// The segments every round prop is turned with. A record holds no segment count, so the kit fixes one for all kinds
const PROP_RADIAL_SEGMENTS = 16;

// A prop's fitted outline as one geometry: the boxes of a solid kind's hull, or a round kind's sections
// Stood on their foot at their axis
export const createPropGeometry = (outline: PropOutline): BufferGeometry => {
  if ("boxes" in outline) return createBoxesGeometry(outline.boxes);
  const [x, z] = outline.axis;
  return createLatheStackGeometry({
    isFaceted: false,
    radialSegments: PROP_RADIAL_SEGMENTS,
    sections: outline.sections,
  }).translate(x, outline.foot, z);
};
