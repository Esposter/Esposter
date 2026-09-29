import type { FogUniforms } from "#src/post/FogUniforms";
import type { Camera } from "three";
import type { Node, TextureNode } from "three/webgpu";

import { exp, float, Fn, getViewPosition, If, max, mix, uniform, uv, vec4 } from "three/tsl";

const MIN_RAY_SLOPE = 0.0001;
// Fog as a haze whose density falls off exponentially with height, integrated along the ray from the eye to what the
// Pixel shows, past a start distance: low ground and the far world thicken toward the sky's colour, and the peaks
// Rise out of it. Applied after the scene pass, so the outlines fade with what they outline, and never to the sky,
// Which already is the fog's colour
export const createHeightFogNode = (
  colorNode: Node<"vec4">,
  depthNode: TextureNode,
  camera: Camera,
  { baseHeight, color, density, heightFalloff, startDistance }: FogUniforms,
): Node<"vec4"> => {
  const cameraWorldMatrix = uniform(camera.matrixWorld);
  const cameraProjectionMatrixInverse = uniform(camera.projectionMatrixInverse);
  return Fn(() => {
    const depth = depthNode.sample(uv()).r;
    const output = colorNode.toVar();
    If(depth.lessThan(1), () => {
      const viewPosition = getViewPosition(uv(), depth, cameraProjectionMatrixInverse);
      const eye = cameraWorldMatrix.mul(vec4(0, 0, 0, 1)).xyz;
      const ray = cameraWorldMatrix.mul(vec4(viewPosition, 1)).xyz.sub(eye);
      const rayLength = ray.length();
      const fogLength = max(rayLength.sub(startDistance), 0);
      const slope = ray.y.div(rayLength);
      // The haze begins where the ray passes the start distance, at the height the ray has reached by then
      const startHeight = eye.y.add(slope.mul(rayLength.min(startDistance)));
      const densityAtStart = density.mul(exp(startHeight.sub(baseHeight).mul(heightFalloff).negate()));
      // Along a level ray the integral is that density times the length, which the general form divides by zero to
      // Reach
      const opticalDepth = densityAtStart.mul(fogLength).toVar();
      If(slope.abs().greaterThan(MIN_RAY_SLOPE), () => {
        const climb = slope.mul(heightFalloff);
        opticalDepth.assign(densityAtStart.mul(float(1).sub(exp(fogLength.mul(climb).negate()))).div(climb));
      });
      const opacity = float(1).sub(exp(opticalDepth.negate()));
      output.assign(vec4(mix(output.rgb, color, opacity), output.a));
    });
    return output;
  })();
};
