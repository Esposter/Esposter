import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";
import type { Node } from "three/webgpu";

import {
  float,
  Fn,
  max,
  mix,
  mx_cell_noise_float,
  mx_fractal_noise_float,
  normalWorldGeometry,
  pow,
  smoothstep,
  vec3,
} from "three/tsl";

// The sun's and the moon's discs, as the cosine of their angular radius, and how far each's glow spreads
const SUN_DISC_COSINE = Math.cos(0.035);
const MOON_DISC_COSINE = Math.cos(0.05);
const SUN_GLOW_POWER = 12;
const HORIZON_GLOW_POWER = 3;
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
// Genshin's painted sky as the scene's background, so it is drawn behind everything at no depth and the fog and god
// Rays pass over it. A gradient from the horizon's colour to the zenith's, the sun's disc and glow, a glow along the
// Horizon toward a low sun, the moon's disc, stars at night, and a cloud layer: noise projected onto a plane
// Overhead and cut into cumulus with a hard edge and a stepped shade band, as the ground's ramp steps its light
export const createSkyNode = ({
  cloudCoverage,
  cloudDrift,
  cloudLitColor,
  cloudShadeColor,
  horizonBand,
  horizonColor,
  lightColor,
  moonDirection,
  starIntensity,
  sunDirection,
  zenithColor,
}: SkyUniforms): Node<"vec3"> =>
  Fn(() => {
    const direction = normalWorldGeometry.normalize();
    const height = direction.y;
    const gradient = mix(horizonColor, zenithColor, smoothstep(0, horizonBand, height));
    const sunCosine = direction.dot(sunDirection);
    const sunVisibility = smoothstep(-0.1, 0.05, sunDirection.y);
    const sunGlow = pow(max(sunCosine, 0), SUN_GLOW_POWER).mul(sunVisibility);
    // A low sun spreads its light along the horizon, as dawn and dusk do, and a high one keeps it to its glow
    const horizonGlow = pow(max(sunCosine, 0), HORIZON_GLOW_POWER)
      .mul(float(1).sub(smoothstep(0, 0.3, height.abs())))
      .mul(float(1).sub(smoothstep(0, 0.5, sunDirection.y)))
      .mul(sunVisibility);
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
    const cloudColor = mix(cloudLitColor, cloudShadeColor, cloudShade).add(lightColor.mul(sunGlow.mul(0.6)));
    const sky = gradient
      .add(lightColor.mul(sunGlow.mul(0.35).add(horizonGlow.mul(0.45))))
      .add(vec3(stars))
      .add(vec3(0.85, 0.88, 1).mul(moonDisc))
      .add(lightColor.mul(sunDisc.mul(SUN_DISC_BRIGHTNESS)));
    return mix(sky, cloudColor, cloudDensity);
  })();
