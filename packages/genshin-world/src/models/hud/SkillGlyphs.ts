import type { GlyphLayer } from "#src/models/hud/GlyphLayer";

// A character's elemental skill and burst icons as the HUD's buttons carry them, one module a traced character beside its
// Kit, loaded with it as the character joins the party, a character with none showing its buttons bare. Each is traced
// Four times enlarged from the wiki's render of its talent (`File:Talent <Name>.png`, 128 pixels), its mark read as each
// Pixel's share of white over the icon's graded disc and traced at the splits between its tones. A layer's opacity is
// Its tone's share of white over its disc in the recording: a skill's pale tone 0.38 and its white 0.78, drawn as 0.65
// Over the pale, as Skyward Sonnet's in `hud-world-pickup` and Chonghua's Layered Frost's in `hud-world-keys` both read,
// And a charged burst's pale tone 0.54 and its white whole, as Cloud-Parting Star's in `hud-world-keys` reads
export interface SkillGlyphs {
  burst: readonly GlyphLayer[];
  skill: readonly GlyphLayer[];
}
