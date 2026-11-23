import type { Node } from "three/webgpu";

import { cameraViewMatrix, mx_noise_float, normalWorld, positionWorld, vec3 } from "three/tsl";

// The step the noise's gradient is taken over, in its own lattice units: small against a cell, large against float
// Rounding
const GRADIENT_STEP = 0.01;

// A procedural normal detail: the engine's noise as a height a `wavelength` metres across, `amplitude` metres high,
// Whose Gradient over the surface leans the normal the material draws. The gradient is three finite differences of the
// Noise, Scaled to metres by the frequency, and only its part across the normal leans it. The leaned normal is in world
// Space, Taken to view space by the camera's view matrix alone, since the object's own transform is already in it, and
// A Material's normal node reads view space, so the witness's normal target and the lighting both see the detail
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
  return normalWorld.sub(tangentSlope).normalize().transformNormalByViewMatrix(cameraViewMatrix);
};
