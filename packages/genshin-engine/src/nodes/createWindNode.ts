import type { WindUniforms } from "#src/wind/WindUniforms";
import type { Node } from "three/webgpu";

import { mx_noise_float, sin, smoothstep, time, vec3 } from "three/tsl";

const TURBULENCE_SCALE = 0.07;
const TURBULENCE_SPEED = 0.4;
// The wind at a point on the ground, as how far it pushes along the ground: the base wind, gusts travelling
// Downwind as bands that swell and fall, and a little turbulence so neighbouring plants never move in step. A field
// Of grass therefore leans together and waves roll across it, as Genshin's meadows do
export const createWindNode = (
  { direction, gustSpeed, gustStrength, gustWidth, strength }: WindUniforms,
  groundPosition: Node<"vec2">,
): Node<"vec2"> => {
  const downwind = groundPosition.dot(direction);
  const gustPhase = downwind
    .sub(time.mul(gustSpeed))
    .div(gustWidth)
    .mul(Math.PI * 2);
  const gust = smoothstep(0.2, 1, sin(gustPhase).mul(0.5).add(0.5)).mul(gustStrength);
  const turbulence = mx_noise_float(vec3(groundPosition.mul(TURBULENCE_SCALE), time.mul(TURBULENCE_SPEED))).mul(0.35);
  return direction.mul(strength.add(gust).mul(turbulence.add(1)));
};
