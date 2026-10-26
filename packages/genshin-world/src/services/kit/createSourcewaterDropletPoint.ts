import type { KitBody } from "#src/models/kit/KitBody";
import type { GroundPoint } from "genshin-engine";

import { getKitBodyPoint } from "#src/services/kit/getKitBodyPoint";

// A point within the range of a centre, its radius drawn by area as gcsim's CalcRandomPointFromCenter draws it
export const createSourcewaterDropletPoint = (
  body: KitBody,
  { forward, right }: { forward: number; right: number },
  [minimum, maximum]: [number, number],
  random: () => number,
): GroundPoint => {
  const centre = getKitBodyPoint(body, forward, right);
  const radius = Math.sqrt(minimum * minimum + random() * (maximum * maximum - minimum * minimum));
  const bearing = random() * 2 * Math.PI;
  return { x: centre.x + Math.cos(bearing) * radius, z: centre.z + Math.sin(bearing) * radius };
};
