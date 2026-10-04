import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";
import type { Texture } from "three";
import type { Node } from "three/webgpu";

import { LEAST_DIVISOR } from "#src/nodes/constants";
import { abs, asin, clamp, float, max, min, mix, pow, saturate, smoothstep, texture, vec2 } from "three/tsl";

// The share of the sun's side where the halo toward it takes over, the span it takes over across, and the sun's height
// Where the halo shows all round the sky, a low sun keeping it toward itself
const HALO_TOWARD_START = 0.3;
const HALO_TOWARD_SPAN = 0.7;
const HALO_SUN_HEIGHT_START = 0.2;
const HALO_SUN_HEIGHT_SPAN = 0.3;
// The sun's halo as three lobes of the same falloff, each ten times wider and fainter than the last
const SUN_HALO_MIDDLE_SPREAD = 0.1;
const SUN_HALO_MIDDLE_WEIGHT = 0.12;
const SUN_HALO_OUTER_SPREAD = 0.01;
const SUN_HALO_OUTER_WEIGHT = 0.03;
// The game's sky colour along a direction, as its sky shader draws it and its clouds fade toward it (Login/Scene/
// Index.reference.ts, sources `atmosphereShader` and `cloudParticleShader`): the direction's height as the share of a
// Right angle it looks up, the top colour mixed toward the bottom by the gradient's red at that height over the bottom
// Colour's reach, each of the two blended from away from the sun to toward it by how far toward the sun it looks; the
// Horizon halo by the gradient's green over its own reach, toward the sun and, once the sun is up, all round; and the
// Sun's halo as three widening lobes, tighter toward the zenith
export const createSkyColorNode = (
  {
    frontBackBlend,
    haloColor,
    haloHeight,
    horizonBackColor,
    horizonBand,
    horizonColor,
    sunDirection,
    sunHaloColor,
    sunHaloSize,
    zenithBackColor,
    zenithColor,
  }: SkyUniforms,
  gradient: Texture,
  direction: Node<"vec3">,
): Node<"vec3"> => {
  const height = direction.y;
  const elevation = abs(asin(clamp(height, -1, 1)).mul(2 / Math.PI));
  const sunCosine = direction.dot(sunDirection);
  // How far toward the sun the direction looks, cubed, which blends each colour from away from the sun to toward it
  const toward = pow(max(sunCosine.mul(frontBackBlend).add(float(1).sub(frontBackBlend)), 0), 3);
  const top = mix(zenithBackColor, zenithColor, toward);
  const bottom = mix(horizonBackColor, horizonColor, toward);
  const bottomShare = texture(gradient, vec2(elevation.div(max(horizonBand, LEAST_DIVISOR)), 0.5)).r;
  const haloShare = texture(gradient, vec2(elevation.div(max(haloHeight, LEAST_DIVISOR)), 0.5)).g;
  const sunSide = saturate(sunCosine.mul(0.5).add(0.5));
  const towardSun = smoothstep(0, 1, max(sunSide.sub(HALO_TOWARD_START).div(HALO_TOWARD_SPAN), 0));
  const sunUp = smoothstep(0, 1, saturate(abs(sunDirection.y).sub(HALO_SUN_HEIGHT_START).div(HALO_SUN_HEIGHT_SPAN)));
  const halo = haloColor.mul(haloShare).mul(sunUp.mul(float(1).sub(towardSun)).add(towardSun));
  const spread = sunHaloSize.mul(abs(height));
  const sunHalo = min(pow(sunSide, spread), 1)
    .add(min(pow(sunSide, spread.mul(SUN_HALO_MIDDLE_SPREAD)), 1).mul(SUN_HALO_MIDDLE_WEIGHT))
    .add(min(pow(sunSide, spread.mul(SUN_HALO_OUTER_SPREAD)), 1).mul(SUN_HALO_OUTER_WEIGHT))
    .mul(smoothstep(0, 1, max(sunSide.sub(0.5).mul(2), 0)));
  return mix(top, bottom, bottomShare).add(halo).add(sunHaloColor.mul(sunHalo));
};
