import type { SilhouetteOptions } from "#src/kits/architecture/SilhouetteOptions";

import { ExtrudeGeometry, ShapePath } from "three";

// A slab whose shape is its side, as a bridge, an arcade or a flat pillar is: its outline and holes in x and y,
// Extruded through its depth along z, so an arch's soffit is a hard edged face. Each hole is put in the ring
// Around it by three's own nesting of the loops
export const createSilhouetteGeometry = ({ contours, depth: [front, back] }: SilhouetteOptions): ExtrudeGeometry => {
  const shapePath = new ShapePath();
  for (const [first, ...rest] of contours) {
    if (!first) continue;
    shapePath.moveTo(...first);
    for (const point of rest) shapePath.lineTo(...point);
  }
  return new ExtrudeGeometry(shapePath.toShapes(), { bevelEnabled: false, depth: back - front }).translate(0, 0, front);
};
