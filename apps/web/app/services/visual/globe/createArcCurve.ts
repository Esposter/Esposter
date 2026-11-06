import type { GlobeArc } from "@/models/visual/GlobeArc";

import { latLngToVector3 } from "@/services/visual/globe/latLngToVector3";
import { CubicBezierCurve3, Vector3 } from "three";

// The two control points sit a third of the way along the great circle from each end. The curve's middle is then
// Exactly (P0 + 3C1 + 3C2 + P3) / 8, so the control radius is solved for the middle to land on the arc's altitude
export const createArcCurve = (
  {
    arcAlt,
    endLat,
    endLng,
    startLat,
    startLng,
  }: Pick<GlobeArc, "arcAlt" | "endLat" | "endLng" | "startLat" | "startLng">,
  radius: number,
) => {
  const start = latLngToVector3(startLat, startLng, radius);
  const end = latLngToVector3(endLat, endLng, radius);
  const angle = start.angleTo(end);
  const axis = new Vector3().crossVectors(start, end);
  // The same place twice has no great circle between it, so the arc rises straight up
  if (axis.lengthSq() < 1e-12) axis.set(0, 1, 0);
  axis.normalize();
  const controlRadius = (8 * radius * (1 + arcAlt) - 2 * radius * Math.cos(angle / 2)) / (6 * Math.cos(angle / 6));
  const startControl = start
    .clone()
    .applyAxisAngle(axis, angle / 3)
    .setLength(controlRadius);
  const endControl = start
    .clone()
    .applyAxisAngle(axis, (angle * 2) / 3)
    .setLength(controlRadius);
  return new CubicBezierCurve3(start, startControl, endControl, end);
};
