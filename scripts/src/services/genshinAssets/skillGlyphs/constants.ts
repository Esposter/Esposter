import type { GlyphTones } from "#src/models/genshinAssets/skillGlyphs/GlyphTones";

import { WORLD_GENERATED_DIRECTORY } from "#src/services/genshinAssets/stats/constants";
import { SkillGlyphTones } from "genshin-world";
import { join } from "node:path";

// The folder of the committed loader map whose entries read each character's icons from the hosted index
export const SKILL_GLYPHS_GENERATED_DIRECTORY: string = join(WORLD_GENERATED_DIRECTORY, "skillGlyphs");
// The shares of white each button draws an icon's tones in, as the recordings read them: a skill's pale tone 0.38 and its
// White 0.78, as Skyward Sonnet's in `hud-world-pickup` and Chonghua's Layered Frost's in `hud-world-keys` both read, and a
// Charged burst's pale tone 0.54 and its white whole, as Cloud-Parting Star's in `hud-world-keys` reads. An icon of one
// Tone is drawn in the white's share alone
export const SkillGlyphTonesMap: Readonly<Record<SkillGlyphTones, GlyphTones>> = {
  [SkillGlyphTones.Burst]: { pale: 0.54, white: 1 },
  [SkillGlyphTones.Skill]: { pale: 0.38, white: 0.78 },
};
// A talent's icon is enlarged this many times before it is traced, so its antialiased edge becomes a curve rather than
// A staircase of its pixels, and its paths are written to a tenth of a unit of the glyph's 128 unit square
export const TALENT_ICON_TRACE_SCALE = 4;
export const GLYPH_SIZE = 128;
export const GLYPH_PATH_DECIMALS = 1;
// An icon's mark is read as each pixel's share of white over its disc's own shade, the shade of its row's darkest tenth,
// Since the disc is graded from top to bottom. The shares are counted in twentieths, those under a twentieth being the
// Disc's own grain
export const DISC_SHADE_QUANTILE = 0.1;
export const TONE_BIN_COUNT = 20;
export const MIN_TONE_SHARE = 0.05;
// Where an icon's tones are looked for: its white at a share of 0.6 or more, and a pale tone from 0.25 to a fifth under
// The white's. A pale tone is the icon's only where its peak stands over three times the median of the ramp up to the
// White, as Skyward Sonnet's, Chonghua's Layered Frost's and Cloud-Parting Star's do (6.6, 6 and 30 times) and Wind's
// Grand Ode's, of one tone, does not (1.3)
export const WHITE_TONE_MIN_SHARE = 0.6;
export const PALE_TONE_MIN_SHARE = 0.25;
export const TONE_MIN_GAP = 0.2;
export const PALE_PEAK_MIN_RATIO = 3;
