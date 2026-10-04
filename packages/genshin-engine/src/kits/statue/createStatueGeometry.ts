import type { BufferGeometry } from "three";

import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";
import { CylinderGeometry, LatheGeometry, Vector2 } from "three";

const PLINTH_SIDES = 8;
const FIGURE_SEGMENTS = 24;
// A robed figure's silhouette from the hem up, in metres from the axis and above the plinth: a flared cloak, the
// Waist, the shoulders, a hood, turned about the axis
const FIGURE_PROFILE = [
  new Vector2(0, 0),
  new Vector2(1.5, 0),
  new Vector2(1.25, 0.8),
  new Vector2(0.85, 2.6),
  new Vector2(0.7, 3.6),
  new Vector2(0.95, 4.3),
  new Vector2(0.6, 4.7),
  new Vector2(0.45, 5.1),
  new Vector2(0.5, 5.5),
  new Vector2(0.3, 6),
  new Vector2(0, 6.2),
];
// A Statue of The Seven's massing: a stepped octagonal plinth and the robed figure standing on it, merged into one
// Geometry for one material. The figure's detail, the pose and the element's emblem, belongs to each region's kit
export const createStatueGeometry = (): BufferGeometry => {
  const lowerStep = new CylinderGeometry(3.2, 3.4, 0.6, PLINTH_SIDES).translate(0, 0.3, 0);
  const upperStep = new CylinderGeometry(2.6, 2.8, 0.6, PLINTH_SIDES).translate(0, 0.9, 0);
  const pedestal = new CylinderGeometry(1.8, 2.1, 2.2, PLINTH_SIDES).translate(0, 2.3, 0);
  const figure = new LatheGeometry(FIGURE_PROFILE, FIGURE_SEGMENTS).translate(0, 3.4, 0);
  const indexedParts = [lowerStep, upperStep, pedestal, figure];
  const statueGeometry = mergeGeometryParts(indexedParts.map((part) => part.toNonIndexed()));
  for (const part of indexedParts) part.dispose();
  statueGeometry.computeVertexNormals();
  return statueGeometry;
};
