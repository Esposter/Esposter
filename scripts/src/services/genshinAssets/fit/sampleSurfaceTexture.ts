import type { Texture } from "#src/models/genshinAssets/fit/Texture";
import type { Vector } from "#src/models/shared/Vector";

import { toTexel } from "#src/services/genshinAssets/fit/toTexel";
import { BYTE } from "#src/services/shared/constants";

// The colour a texture holds at the texel its UV falls on, as red, green and blue in bytes, and how far that texel is
// Covered: its alpha where the texture has one, so a leaf's transparent texels count for nothing, and none otherwise.
// A texture with fewer than three channels paints its texels grey, from its first channel
export const sampleSurfaceTexture = (
  { data, info }: Texture,
  uv: readonly [number, number],
): { colour: Vector; coverage: number } => {
  const [column, row] = toTexel(uv, info);
  const offset = (row * info.width + column) * info.channels;
  const hasAlpha = info.channels === 2 || info.channels === 4;
  return {
    colour: ([0, 1, 2] as const).map((channel) => data[offset + Math.min(channel, info.channels - 1)] ?? 0) as Vector,
    coverage: hasAlpha ? (data[offset + info.channels - 1] ?? 0) / BYTE : 1,
  };
};
