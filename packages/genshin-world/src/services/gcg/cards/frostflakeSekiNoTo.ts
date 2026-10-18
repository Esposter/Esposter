import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

export const FROSTFLAKE_SEKI_NO_TO_ID = 111_051;
const FROSTFLAKE_SEKI_NO_TO_DAMAGE = 2;

// Frostflake Seki no To, the summon Kamisato Art: Soumetsu creates: at each End Phase, 2 Cryo DMG, for two usages (the
// Wiki's Frostflake Seki no To)
export const frostflakeSekiNoTo: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Cryo, value: FROSTFLAKE_SEKI_NO_TO_DAMAGE };
  },
};
