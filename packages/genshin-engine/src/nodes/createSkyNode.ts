import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";
import type { Texture } from "three";
import type { Node } from "three/webgpu";

import { createSkyColorNode } from "#src/nodes/createSkyColorNode";
import {
  float,
  Fn,
  max,
  mix,
  mx_cell_noise_float,
  mx_fractal_noise_float,
  normalWorldGeometry,
  pow,
  saturate,
  smoothstep,
  vec3,
} from "three/tsl";

// The sun's and the moon's discs, as the cosine of their angular radius: the game draws each as a body of its own
const SUN_DISC_COSINE = Math.cos(0.035);
const MOON_DISC_COSINE = Math.cos(0.05);
// The sun's disc is brighter than white, so bloom lifts it
const SUN_DISC_BRIGHTNESS = 6;
// The cloud layer's scale on the sky, its lowest height before it fades into the horizon, and the width of the
// Stepped band between a cloud's lit top and its shade, and between the sky and a cloud's edge
const CLOUD_SCALE = 1.6;
const CLOUD_MIN_HEIGHT = 0.04;
const CLOUD_EDGE = 0.04;
const CLOUD_SHADE_DEPTH = 0.18;
const STAR_SCALE = 420;
const STAR_THRESHOLD = 0.9975;
// The least a size is divided by, as the game's shader guards its own
const LEAST_DIVISOR = 1e-4;
// The moon's glow, its size a tenth of the moon's own, falling off as the sixth power
const MOON_GLOW_SPREAD = 0.1;
const MOON_GLOW_POWER = 6;
// Genshin's sky as the scene's background, drawn behind everything at no depth so the fog and god rays pass over it,
// As the game's own sky shader draws it (`createSkyColorNode`, Login/Scene/Index.reference.ts, source `atmosphereShader`): a ray's height
// As the share of a right angle it looks up, its colour the top colour mixed toward the bottom by the gradient's red
// At that height over the bottom colour's reach, each of the two blended from away from the sun to toward it by how
// Far toward the sun the ray looks; the horizon halo by the gradient's green over its own reach, toward the sun and,
// Once the sun is up, all round; the sun's halo as three widening lobes, tighter toward the zenith; and the moon's
// Glow. Over it the sun's and moon's discs, stars at night, and a cloud layer: noise projected onto a plane overhead
// And cut into cumulus with a hard edge and a stepped shade band, as the ground's ramp steps its light
export const createSkyNode = (uniforms: SkyUniforms, gradient: Texture): Node<"vec3"> => {
  const {
    cloudCoverage,
    cloudDrift,
    cloudLitColor,
    cloudShadeColor,
    lightColor,
    moonDirection,
    moonGlowColor,
    moonSize,
    starIntensity,
    sunDirection,
  } = uniforms;
  return Fn(() => {
    const direction = normalWorldGeometry.normalize();
    const height = direction.y;
    const sunCosine = direction.dot(sunDirection);
    const gradientColor = createSkyColorNode(uniforms, gradient, direction);
    const moonCosine = saturate(direction.dot(moonDirection));
    const moonGlow = pow(
      max(
        moonCosine
          .sub(1)
          .div(max(moonSize.mul(MOON_GLOW_SPREAD), LEAST_DIVISOR))
          .add(1),
        0,
      ),
      MOON_GLOW_POWER,
    );
    const sunVisibility = smoothstep(-0.1, 0.05, sunDirection.y);
    const sunDisc = smoothstep(SUN_DISC_COSINE - 0.0005, SUN_DISC_COSINE, sunCosine).mul(sunVisibility);
    const moonDisc = smoothstep(MOON_DISC_COSINE - 0.0005, MOON_DISC_COSINE, direction.dot(moonDirection)).mul(
      smoothstep(-0.05, 0.05, moonDirection.y),
    );
    const stars = smoothstep(STAR_THRESHOLD, 1, mx_cell_noise_float(direction.mul(STAR_SCALE)))
      .mul(starIntensity)
      .mul(smoothstep(0, 0.1, height));
    // The cloud plane overhead, reached by dividing by the ray's height, so clouds shrink toward the horizon
    const cloudPosition = direction.xz.div(max(height, CLOUD_MIN_HEIGHT)).mul(CLOUD_SCALE).add(cloudDrift);
    const cloudNoise = mx_fractal_noise_float(vec3(cloudPosition, 0), 4, 2, 0.5).mul(0.5).add(0.5);
    const cloudThreshold = float(1).sub(cloudCoverage);
    const cloudDensity = smoothstep(cloudThreshold, cloudThreshold.add(CLOUD_EDGE), cloudNoise).mul(
      smoothstep(0, 0.12, height),
    );
    // The thick of a cloud is in its own shade, cut by the same kind of narrow step as the ground's light
    const cloudShade = smoothstep(
      cloudThreshold.add(CLOUD_SHADE_DEPTH),
      cloudThreshold.add(CLOUD_SHADE_DEPTH + CLOUD_EDGE),
      cloudNoise,
    );
    const cloudColor = mix(cloudLitColor, cloudShadeColor, cloudShade);
    const sky = gradientColor
      .add(moonGlowColor.mul(moonGlow))
      .add(vec3(stars))
      .add(vec3(0.85, 0.88, 1).mul(moonDisc))
      .add(lightColor.mul(sunDisc.mul(SUN_DISC_BRIGHTNESS)));
    return mix(sky, cloudColor, cloudDensity);
  })();
};
