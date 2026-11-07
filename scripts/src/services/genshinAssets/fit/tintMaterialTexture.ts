import type { Texture } from "#src/models/genshinAssets/fit/Texture";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";

import { tintTexture } from "#src/services/genshinAssets/fit/tintTexture";
import { MAIN_COLOUR_PROPERTY } from "#src/services/genshinAssets/shared/constants";

// A material's main colour as the tint its textures are drawn under, untinted where it has none
export const readMaterialTint = (material: MaterialValues | undefined): [number, number, number] => {
  const [red = 1, green = 1, blue = 1] = material?.colors[MAIN_COLOUR_PROPERTY] ?? [];
  return [red, green, blue];
};

// A texture as the material it is drawn with draws it: under the material's main colour, or untinted when it has none.
// Every reader of an exported texture under its material goes through here, so a surface and a picture read one tint
export const tintMaterialTexture = (texture: Texture, material: MaterialValues | undefined): Texture =>
  tintTexture(texture, readMaterialTint(material));
