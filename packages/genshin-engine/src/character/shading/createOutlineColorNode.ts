import type { CharacterShadingInputs } from "#src/models/character/CharacterShadingInputs";
import type { OutlineRegions } from "#src/models/character/OutlineRegions";
import type { Vector3Tuple } from "three";
import type { Node } from "three/webgpu";

import { FLAT_LIGHT_MAP, OUTLINE_MAIN_TEXTURE_SHARE } from "#src/character/shading/constants";
import { createShadingRegionNode } from "#src/character/shading/createShadingRegionNode";
import { createToneNode } from "#src/character/shading/createToneNode";
import { selectRegionNode } from "#src/character/shading/selectRegionNode";
import { float, mix, texture, uv, vec3 } from "three/tsl";

const UNTINTED: Vector3Tuple = [1, 1, 1];

// The game's outline colour at a pixel, the TSL form of the outline's colour on the shading page: with no later region
// Turned on, the outline's own colour; with one, the region's tint times its outline colour, by the region the
// Lightmap's alpha selects. Each is drawn toward a fifth of the main texture by its region's intensity, then toned as the
// Body is
export const createOutlineColorNode = (
  {
    color,
    contrastScale,
    desaturateScale,
    lightMapTexture,
    mainTexture,
    regionTints,
    regionToggles,
  }: CharacterShadingInputs,
  { colors, intensities }: OutlineRegions,
): Node<"vec3"> => {
  const isRegioned = Object.values(regionToggles).some(Boolean);
  const region = createShadingRegionNode(
    lightMapTexture ? texture(lightMapTexture, uv()).a : float(FLAT_LIGHT_MAP[3]),
    regionToggles,
  );
  const tints = { ...regionTints, one: color };
  const outlineColor = selectRegionNode(region, (regionName) => {
    const [red, green, blue] = colors[regionName];
    const [tintRed, tintGreen, tintBlue] = isRegioned ? tints[regionName] : UNTINTED;
    return vec3(red * tintRed, green * tintGreen, blue * tintBlue);
  });
  const mainShare = (mainTexture ? texture(mainTexture, uv()).rgb : vec3(1)).mul(OUTLINE_MAIN_TEXTURE_SHARE);
  const intensity = selectRegionNode(region, (regionName) => float(intensities[regionName]));
  return createToneNode(mix(outlineColor, mainShare, intensity), desaturateScale, contrastScale);
};
