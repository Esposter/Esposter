import type { GlyphLayer } from "#src/models/hud/GlyphLayer";

// A character's elemental skill and burst icons as the HUD's buttons carry them
export interface SkillGlyphs {
  burst: readonly GlyphLayer[];
  skill: readonly GlyphLayer[];
}
