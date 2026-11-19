import type { Node } from "three/webgpu";

import { mx_fractal_noise_float, time, vec2, vec3 } from "three/tsl";

const RIPPLE_SCALE = 0.08;
const RIPPLE_SPEED = 0.05;
const RIPPLE_SLOPE = 0.35;

// The surface normal of the water's ripples at a point, its two layers of noise drifting apart, whose slopes, read by
// Finite differences, tilt it. The pattern is sampled at the flowed position the caller gives, so a flow carries it
// Downstream and still water samples in place
export const createWaterRippleNormal = (flowedPosition: Node<"vec2">): Node<"vec3"> => {
  const ripplePosition = flowedPosition.mul(RIPPLE_SCALE);
  const drift = time.mul(RIPPLE_SPEED);
  const sampleRipples = (offset: Node<"vec2">) =>
    mx_fractal_noise_float(vec3(ripplePosition.add(offset).add(vec2(drift, drift.mul(0.6))), 0), 3)
      .add(
        mx_fractal_noise_float(
          vec3(
            ripplePosition
              .add(offset)
              .mul(1.9)
              .sub(vec2(drift.mul(0.8), drift)),
            1,
          ),
          2,
        ),
      )
      .mul(0.5);
  const ripple = sampleRipples(vec2(0, 0));
  const slopeX = sampleRipples(vec2(0.02, 0)).sub(ripple);
  const slopeZ = sampleRipples(vec2(0, 0.02)).sub(ripple);
  return vec3(slopeX.mul(-RIPPLE_SLOPE / 0.02), 1, slopeZ.mul(-RIPPLE_SLOPE / 0.02)).normalize();
};
