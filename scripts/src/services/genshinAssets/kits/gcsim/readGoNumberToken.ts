import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

// The number a Number token reads as, with its underscores dropped and its base kept, `1_000` or `0x1F`
export const readGoNumberToken = (token: GoToken): number => Number(token.text.replaceAll("_", ""));
