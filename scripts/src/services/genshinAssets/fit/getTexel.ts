import type { Texture } from "#src/models/genshinAssets/fit/Texture";

import { toTexel } from "#src/services/genshinAssets/fit/toTexel";
import { BYTE } from "#src/services/shared/constants";

export const getTexel = ({ data, info }: Texture, uv: readonly [number, number], channel: number): number => {
  const [column, row] = toTexel(uv, info);
  return (data[(row * info.width + column) * info.channels + channel] ?? 0) / BYTE;
};
