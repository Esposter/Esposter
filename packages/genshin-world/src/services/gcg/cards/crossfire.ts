import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";

const XIANGLING_ID = 1302;
const GUOBA_ATTACK_ID = 13_022;
const CROSSFIRE_DAMAGE = 1;

// Crossfire, Xiangling's talent: equipped to her while she is active, and her Guoba Attack is used at once. Each Guoba Attack
// She then uses also deals 1 Pyro DMG
export const crossfire: GcgCardModule = {
  ...createGcgTalentCard(XIANGLING_ID, GUOBA_ATTACK_ID),
  onSkillUsed: (context) =>
    context.skill?.id === GUOBA_ATTACK_ID ? { damageType: Element.Pyro, value: CROSSFIRE_DAMAGE } : undefined,
};
