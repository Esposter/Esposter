import type { GlyphLayer } from "#src/models/hud/GlyphLayer";

import { glyphLayerSchema } from "#src/models/hud/GlyphLayer";
import { SkillGlyphTones } from "#src/models/hud/SkillGlyphTones";
import { z } from "zod";

// A character's elemental skill and burst icons as the HUD's buttons carry them, its entry of the hosted `skillGlyphs`
// Index, which `genshin:assets skill-glyphs` traces from the wiki's render of each talent and the world reads with the
// Character's kit as it joins the party. A character the index lacks shows its buttons bare
export interface SkillGlyphs {
  [SkillGlyphTones.Burst]: readonly GlyphLayer[];
  [SkillGlyphTones.Skill]: readonly GlyphLayer[];
}

export const skillGlyphsSchema = z.object({
  [SkillGlyphTones.Burst]: z.array(glyphLayerSchema),
  [SkillGlyphTones.Skill]: z.array(glyphLayerSchema),
}) satisfies z.ZodType<SkillGlyphs>;
