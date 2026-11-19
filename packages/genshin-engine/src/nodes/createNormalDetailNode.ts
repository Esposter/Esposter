import type { Node } from "three/webgpu";

import { mx_noise_float, normalWorld, positionWorld, transformNormalToView, vec3 } from "three/tsl";

// The step the noise's gradient is taken over, in its own lattice units: small against a cell, large against float rounding
const GRADIENT_STEP = 0.01;

// A procedural normal detail: the engine's noise as a height a `wavelength` metres across, `amplitude` metres high, whose
// Gradient over the surface leans the normal the material draws. The gradient is three finite differences of the noise,
// Scaled to metres by the frequency, and only its part across the normal leans it. The result is in view space, as a
// Material's normal node reads it, so the witness's normal target and the lighting both see the detail
export const createNormalDetailNode = (wavelength: number, amplitude: number): Node<"vec3"> => {
  const frequency = 1 / wavelength;
  const lattice = positionWorld.mul(frequency);
  const height = mx_noise_float(lattice);
  const slope = vec3(
    mx_noise_float(lattice.add(vec3(GRADIENT_STEP, 0, 0))).sub(height),
    mx_noise_float(lattice.add(vec3(0, GRADIENT_STEP, 0))).sub(height),
    mx_noise_float(lattice.add(vec3(0, 0, GRADIENT_STEP))).sub(height),
  ).mul((amplitude * frequency) / GRADIENT_STEP);
  const tangentSlope = slope.sub(normalWorld.mul(slope.dot(normalWorld)));
  return transformNormalToView(normalWorld.sub(tangentSlope).normalize()).normalize();
};
