import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";
import type { LightUniforms } from "#src/nodes/LightUniforms";
import type { WaterUniforms } from "#src/water/WaterUniforms";
import type { Node } from "three/webgpu";

import { DoubleSide } from "three";
import {
  cameraFar,
  cameraNear,
  cameraPosition,
  float,
  mix,
  mx_fractal_noise_float,
  perspectiveDepthToViewZ,
  pow,
  positionView,
  positionWorld,
  reflect,
  screenUV,
  smoothstep,
  time,
  vec2,
  vec3,
  viewportDepthTexture,
  viewportSharedTexture,
} from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

const RIPPLE_SCALE = 0.08;
const RIPPLE_SPEED = 0.05;
const RIPPLE_SLOPE = 0.35;
const REFRACTION_STRENGTH = 0.015;
const GLINT_POWER = 180;
// Glints are brighter than white, so bloom lifts them
const GLINT_BRIGHTNESS = 5;
const FOAM_SCALE = 0.6;
const REFLECTION_STRENGTH = 0.55;
// Genshin's water as one unlit material over the scene behind it. How much water lies between the surface and the
// Floor, read from the scene's depth along the view ray, grades its colour from the shallow tint to the deep one and
// Lets the floor show through the shallows, bent by the ripples. Where that depth is small, at every shore, rock or
// Pillar, animated foam lines gather with no mesh authored. The sun breaks on the ripples into hard glints stepped
// Out of a narrow highlight, and the sky's colours are reflected toward the horizon
export const createWaterMaterial = (
  { lightColor, sunDirection }: Pick<LightUniforms, "lightColor" | "sunDirection">,
  { horizonColor, zenithColor }: Pick<SkyUniforms, "horizonColor" | "zenithColor">,
  { deepColor, deepDepth, foamColor, foamDepth, shallowColor }: WaterUniforms,
): MeshBasicNodeMaterial => {
  const waterMaterial = new MeshBasicNodeMaterial({ side: DoubleSide, transparent: true });
  // Two layers of noise drifting apart, whose slopes, read by finite differences, tilt the surface normal
  const ripplePosition = positionWorld.xz.mul(RIPPLE_SCALE);
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
  const normal = vec3(slopeX.mul(-RIPPLE_SLOPE / 0.02), 1, slopeZ.mul(-RIPPLE_SLOPE / 0.02)).normalize();
  const refractedUV = screenUV.add(normal.xz.mul(REFRACTION_STRENGTH));
  const floorViewZ = perspectiveDepthToViewZ(viewportDepthTexture(refractedUV), cameraNear, cameraFar);
  // Water behind a nearer object would pull it into the refraction, so there the unbent floor is read instead
  const isBentPastSurface = floorViewZ.greaterThan(positionView.z);
  const floorUV = isBentPastSurface.select(screenUV, refractedUV);
  const depth = positionView.z
    .sub(perspectiveDepthToViewZ(viewportDepthTexture(floorUV), cameraNear, cameraFar))
    .max(0);
  const deepness = smoothstep(0, deepDepth, depth);
  const waterColor = mix(shallowColor, deepColor, deepness);
  const floorColor = viewportSharedTexture(floorUV).rgb;
  const clarity = float(1).sub(smoothstep(0, deepDepth.mul(0.6), depth));
  const tinted = mix(waterColor, floorColor.mul(shallowColor.mul(1.4)), clarity.mul(0.8));
  const eyeDirection = cameraPosition.sub(positionWorld).normalize();
  const fresnel = pow(float(1).sub(normal.dot(eyeDirection).abs().saturate()), 4);
  const skyColor = mix(horizonColor, zenithColor, 0.35);
  const reflected = mix(tinted, skyColor, fresnel.mul(REFLECTION_STRENGTH));
  const highlight = pow(reflect(sunDirection.negate(), normal).dot(eyeDirection).max(0), GLINT_POWER);
  const glints = lightColor.mul(smoothstep(0.45, 0.5, highlight).mul(GLINT_BRIGHTNESS));
  const shore = float(1).sub(smoothstep(0, foamDepth, depth));
  const foamNoise = mx_fractal_noise_float(vec3(positionWorld.xz.mul(FOAM_SCALE), time.mul(0.3)), 2)
    .mul(0.5)
    .add(0.5);
  const foam = smoothstep(0.55, 0.6, foamNoise.add(shore.mul(0.5))).mul(shore);
  waterMaterial.colorNode = mix(reflected, foamColor, foam).add(glints);
  return waterMaterial;
};
