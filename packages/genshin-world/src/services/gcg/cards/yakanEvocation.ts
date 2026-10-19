import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { SESSHOU_SAKURA_ID } from "#src/services/gcg/cards/constants";
import { sesshouSakura } from "#src/services/gcg/cards/sesshouSakura";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

// Yakan Evocation, Yae Miko's Elemental Skill, which deals no DMG: it summons a Sesshou Sakura, and when one is already on
// Its side it raises that Sesshou's DMG by 1, once (the wiki does not name the target of the raise, so it is provisional)
export const yakanEvocation: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const sesshou = side.summons.find(({ cardId }) => cardId === SESSHOU_SAKURA_ID);
    if (sesshou) sesshou.counter = 1;
    placeGcgZoneCard(side.summons, SESSHOU_SAKURA_ID, sesshouSakura);
  },
};
