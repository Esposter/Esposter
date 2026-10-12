import type { GlyphTones } from "#src/models/genshinAssets/skillGlyphs/GlyphTones";
import type { GlyphLayer } from "genshin-world";

import {
  GLYPH_PATH_DECIMALS,
  GLYPH_SIZE,
  TALENT_ICON_TRACE_SCALE,
} from "#src/services/genshinAssets/skillGlyphs/constants";
import { getToneSplits } from "#src/services/genshinAssets/skillGlyphs/getToneSplits";
import { readWhiteShares } from "#src/services/genshinAssets/skillGlyphs/readWhiteShares";
import { traceMask } from "#src/services/genshinParity/shared/traceMask";
import sharp from "sharp";

// A talent's icon as the layers a HUD button draws it in, on its 128 unit square: its mark read as each pixel's share of
// White over its disc (`readWhiteShares`), its tones split where `getToneSplits` finds them, and the mark traced at each
// Split, enlarged first. An icon with a pale tone under its white is two layers, the pale shape and the white one over
// It, drawn so the two stack to the button's shares; an icon of one tone is its white alone. A pale tone is faint, so the
// Source's grain on it is as strong as its edge, and its split is taken over the shares smoothed by a pixel of the source
export const traceTalentIcon = async (path: string, { pale, white }: GlyphTones): Promise<GlyphLayer[]> => {
  const { width } = await sharp(path).metadata();
  const size = width * TALENT_ICON_TRACE_SCALE;
  const enlarged = sharp(path).ensureAlpha().resize(size, size, { kernel: "lanczos3" });
  const [shares, smoothShares] = await Promise.all([
    readWhiteShares(enlarged.clone(), size),
    readWhiteShares(enlarged.clone().blur(TALENT_ICON_TRACE_SCALE), size),
  ]);
  const tracePath = (splitShares: Float32Array, split: number) =>
    traceMask(
      Uint8Array.from(splitShares, (share) => Number(share > split)),
      size,
      size,
      { decimals: GLYPH_PATH_DECIMALS, unitsPerPixel: GLYPH_SIZE / size },
    ).join(" ");
  const [markSplit = 0, whiteSplit] = getToneSplits(shares);
  if (whiteSplit === undefined) return [{ opacity: white, path: tracePath(shares, markSplit) }];
  return [
    { opacity: pale, path: tracePath(smoothShares, markSplit) },
    // The white shape over the pale one, in the share that brings the two together to the white's
    { opacity: Number(((white - pale) / (1 - pale)).toFixed(2)), path: tracePath(shares, whiteSplit) },
  ];
};
