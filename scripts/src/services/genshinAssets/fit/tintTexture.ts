import type { Texture } from "#src/models/genshinAssets/fit/Texture";
import type { Vector } from "#src/models/shared/Vector";

import { BYTE } from "#src/services/shared/constants";
import { toLinear } from "#src/services/shared/toLinear";
import { toSrgb } from "#src/services/shared/toSrgb";

// A texture as a material draws it under its main colour, as the witness and the game's G-buffer hold it: each texel's
// SRGB colour decoded to linear light, multiplied by the tint, linear red, green and blue, and encoded back to bytes,
// Clamped at white, its alpha kept. A grey texture, one channel or two with alpha, is widened to three so a coloured tint
// Can colour it, and a white tint returns the texture itself
export const tintTexture = (texture: Texture, tint: Vector): Texture => {
  if (tint.every((channel) => channel === 1)) return texture;
  const { data, info } = texture;
  const hasAlpha = info.channels === 2 || info.channels === 4;
  const colourChannelCount = hasAlpha ? info.channels - 1 : info.channels;
  const channelCount = hasAlpha ? 4 : 3;
  // Each channel's byte under its tint, read from a table of the bytes rather than decoded texel by texel
  const tables = tint.map((channel) =>
    Uint8ClampedArray.from({ length: BYTE + 1 }, (_value, byte) => toSrgb(toLinear(byte / BYTE) * channel) * BYTE),
  );
  const tinted = Buffer.alloc(info.width * info.height * channelCount);
  for (let texel = 0; texel < info.width * info.height; texel++) {
    for (const [channel, table] of tables.entries())
      tinted[texel * channelCount + channel] =
        table[data[texel * info.channels + Math.min(channel, colourChannelCount - 1)] ?? 0] ?? 0;
    if (hasAlpha)
      tinted[texel * channelCount + channelCount - 1] = data[texel * info.channels + info.channels - 1] ?? 0;
  }
  return { data: tinted, info: { ...info, channels: channelCount } };
};
