import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";
import type { Texture } from "three";
import type { Node } from "three/webgpu";

import {
  abs,
  asin,
  clamp,
  float,
  Fn,
  max,
  min,
  mix,
  mx_cell_noise_float,
  mx_fractal_noise_float,
  normalWorldGeometry,
  pow,
  saturate,
  smoothstep,
  texture,
  vec2,
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
// The least a height or a size is divided by, as the game's shader guards its own
const LEAST_DIVISOR = 1e-4;
// The share of the sun's dot product where the halo toward it takes over, the span it takes over across, and the sun's
// Height where the halo shows all round the sky, a low sun keeping it toward itself
const HALO_TOWARD_START = 0.3;
const HALO_TOWARD_SPAN = 0.7;
const HALO_SUN_HEIGHT_START = 0.2;
const HALO_SUN_HEIGHT_SPAN = 0.3;
// The sun's halo as three lobes of the same falloff, each ten times wider and fainter than the last
const SUN_HALO_MIDDLE_SPREAD = 0.1;
const SUN_HALO_MIDDLE_WEIGHT = 0.12;
const SUN_HALO_OUTER_SPREAD = 0.01;
const SUN_HALO_OUTER_WEIGHT = 0.03;
// The moon's glow, its size a tenth of the moon's own, falling off as the sixth power
const MOON_GLOW_SPREAD = 0.1;
const MOON_GLOW_POWER = 6;
// Genshin's sky as the scene's background, drawn behind everything at no depth so the fog and god rays pass over it,
// As the game's own sky shader draws it (Login/Scene/Index.reference.ts, source `atmosphereShader`): a ray's height
// As the share of a right angle it looks up, its colour the top colour mixed toward the bottom by the gradient's red
// At that height over the bottom colour's reach, each of the two blended from away from the sun to toward it by how
// Far toward the sun the ray looks; the horizon halo by the gradient's green over its own reach, toward the sun and,
// Once the sun is up, all round; the sun's halo as three widening lobes, tighter toward the zenith; and the moon's
// Glow. Over it the sun's and moon's discs, stars at night, and a cloud layer: noise projected onto a plane overhead
// And cut into cumulus with a hard edge and a stepped shade band, as the ground's ramp steps its light
export const createSkyNode = (
  {
    cloudCoverage,
    cloudDrift,
    cloudLitColor,
    cloudShadeColor,
    frontBackBlend,
    haloColor,
    haloHeight,
    horizonBackColor,
    horizonBand,
    horizonColor,
    lightColor,
    moonDirection,
    moonGlowColor,
    moonSize,
    starIntensity,
    sunDirection,
    sunHaloColor,
    sunHaloSize,
    zenithBackColor,
    zenithColor,
  }: SkyUniforms,
  gradient: Texture,
): Node<"vec3"> =>
  Fn(() => {
    const direction = normalWorldGeometry.normalize();
    const height = direction.y;
    const elevation = abs(asin(clamp(height, -1, 1)).mul(2 / Math.PI));
    const sunCosine = direction.dot(sunDirection);
    // How far toward the sun the ray looks, cubed, which blends each colour from away from the sun to toward it
    const toward = pow(max(sunCosine.mul(frontBackBlend).add(float(1).sub(frontBackBlend)), 0), 3);
    const top = mix(zenithBackColor, zenithColor, toward);
    const bottom = mix(horizonBackColor, horizonColor, toward);
    const bottomShare = texture(gradient, vec2(elevation.div(max(horizonBand, LEAST_DIVISOR)), 0.5)).r;
    const haloShare = texture(gradient, vec2(elevation.div(max(haloHeight, LEAST_DIVISOR)), 0.5)).g;
    const sunSide = saturate(sunCosine.mul(0.5).add(0.5));
    const towardSun = smoothstep(0, 1, max(sunSide.sub(HALO_TOWARD_START).div(HALO_TOWARD_SPAN), 0));
    const sunUp = smoothstep(0, 1, saturate(abs(sunDirection.y).sub(HALO_SUN_HEIGHT_START).div(HALO_SUN_HEIGHT_SPAN)));
    const halo = haloColor.mul(haloShare).mul(sunUp.mul(float(1).sub(towardSun)).add(towardSun));
    const gradientColor = mix(top, bottom, bottomShare).add(halo);
    // The sun's halo, tighter the higher the ray, its three lobes each clipped to one, fading out away from the sun
    const spread = sunHaloSize.mul(abs(height));
    const sunHalo = min(pow(sunSide, spread), 1)
      .add(min(pow(sunSide, spread.mul(SUN_HALO_MIDDLE_SPREAD)), 1).mul(SUN_HALO_MIDDLE_WEIGHT))
      .add(min(pow(sunSide, spread.mul(SUN_HALO_OUTER_SPREAD)), 1).mul(SUN_HALO_OUTER_WEIGHT))
      .mul(smoothstep(0, 1, max(sunSide.sub(0.5).mul(2), 0)));
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
      .add(sunHaloColor.mul(sunHalo))
      .add(moonGlowColor.mul(moonGlow))
      .add(vec3(stars))
      .add(vec3(0.85, 0.88, 1).mul(moonDisc))
      .add(lightColor.mul(sunDisc.mul(SUN_DISC_BRIGHTNESS)));
    return mix(sky, cloudColor, cloudDensity);
  })();
