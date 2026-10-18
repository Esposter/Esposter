import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";

// Floral Brush, Collei's elemental skill: 3 Dendro DMG (the wiki's Floral Brush (Character Card Skill))
const FLORAL_BRUSH_DAMAGE = 3;

export const floralBrush: GcgSkillModule = {
  getDamage: () => ({ damageType: Element.Dendro, value: FLORAL_BRUSH_DAMAGE }),
};
