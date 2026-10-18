import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { FROSTFLAKE_SEKI_NO_TO_ID, frostflakeSekiNoTo } from "#src/services/gcg/cards/frostflakeSekiNoTo";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const SOUMETSU_DAMAGE = 4;

// Kamisato Art: Soumetsu, Ayaka's burst: 4 Cryo DMG, and a Frostflake Seki no To is summoned once the damage is dealt (the
// Wiki's Kamisato Art: Soumetsu (Character Card Skill))
export const kamisatoArtSoumetsu: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).summons.push(createGcgZoneCard(FROSTFLAKE_SEKI_NO_TO_ID, frostflakeSekiNoTo));
  },
  getDamage: () => ({ damageType: Element.Cryo, value: SOUMETSU_DAMAGE }),
};
