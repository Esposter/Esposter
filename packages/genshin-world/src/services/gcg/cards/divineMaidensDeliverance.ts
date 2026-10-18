import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { talismanSpirit } from "#src/services/gcg/cards/talismanSpirit";
import { TALISMAN_SPIRIT_ID } from "#src/services/gcg/cards/constants";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";

const DIVINE_MAIDENS_DELIVERANCE_DAMAGE = 1;

// Divine Maiden's Deliverance, Shenhe's burst: 1 Cryo DMG, and a Talisman Spirit is summoned on her side once the damage is
// dealt (the wiki's Divine Maiden's Deliverance (Character Card Skill))
export const divineMaidensDeliverance: GcgSkillModule = {
  afterDamage: createGcgSummonAfterDamage(TALISMAN_SPIRIT_ID, talismanSpirit),
  getDamage: () => ({ damageType: Element.Cryo, value: DIVINE_MAIDENS_DELIVERANCE_DAMAGE }),
};
