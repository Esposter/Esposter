import type { WaterUniforms } from "#src/models/water/WaterUniforms";

import { DoubleSide } from "three";
import { mx_fractal_noise_float, smoothstep, time, uv, vec2, vec3 } from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

// Streaks across a sheet's width, stretched down it, so the water falls in long threads. Each thread is a band of noise
// Stepped hard into a streak, and the sheet's foam colour is the water as it falls
const STREAK_DENSITY = 14;
const STREAK_LENGTH = 0.25;
// How fast the streaks fall, in sheet heights a second
const FALL_SPEED = 1.6;
const STREAK_LOW = 0.55;
const STREAK_HIGH = 0.62;

// A waterfall's sheet as the foam colour streaked along its fall, opaque where a streak is and clear between them
export const createWaterfallMaterial = ({ foamColor }: Pick<WaterUniforms, "foamColor">): MeshBasicNodeMaterial => {
  const waterfallMaterial = new MeshBasicNodeMaterial({ side: DoubleSide, transparent: true });
  const streakPosition = vec2(uv().x.mul(STREAK_DENSITY), uv().y.mul(STREAK_LENGTH).sub(time.mul(FALL_SPEED)));
  const streakNoise = mx_fractal_noise_float(vec3(streakPosition, 0), 2).mul(0.5).add(0.5);
  waterfallMaterial.colorNode = foamColor;
  waterfallMaterial.opacityNode = smoothstep(STREAK_LOW, STREAK_HIGH, streakNoise);
  return waterfallMaterial;
};
