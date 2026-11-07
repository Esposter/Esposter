import type { Texture } from "#src/models/genshinAssets/fit/Texture";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";
import type { Vector } from "#src/models/shared/Vector";

import { tintMaterialTexture } from "#src/services/genshinAssets/fit/tintMaterialTexture";
import { InvalidOperationError, Operation } from "@esposter/shared";

const OPAQUE_ALPHA = 255;

// A picture's mean colour as its material draws it, as sRGB bytes: each visible texel's colour averaged, weighted by its
// Alpha, so a transparent border counts for nothing. A stand-in for the picture takes this colour, so its place reads in
// The picture's own tone. A picture with no visible texel has no colour to take
export const fitPictureColour = (texture: Texture, material?: MaterialValues): Vector => {
  const { data, info } = tintMaterialTexture(texture, material);
  const hasAlpha = info.channels === 2 || info.channels === 4;
  const colourChannelCount = hasAlpha ? info.channels - 1 : info.channels;
  const channelAt = (texel: number, channel: number): number =>
    data[texel * info.channels + Math.min(channel, colourChannelCount - 1)] ?? 0;
  let [red, green, blue, weight] = [0, 0, 0, 0];
  for (let texel = 0; texel < info.width * info.height; texel++) {
    const alpha = hasAlpha ? (data[texel * info.channels + info.channels - 1] ?? 0) : OPAQUE_ALPHA;
    if (alpha === 0) continue;
    weight += alpha;
    red += channelAt(texel, 0) * alpha;
    green += channelAt(texel, 1) * alpha;
    blue += channelAt(texel, 2) * alpha;
  }
  if (weight === 0) throw new InvalidOperationError(Operation.Read, "picture", "has no visible texel to measure");
  return [Math.round(red / weight), Math.round(green / weight), Math.round(blue / weight)];
};
