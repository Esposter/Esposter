import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { sweepingTime } from "#src/services/gcg/cards/sweepingTime";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const SWEEPING_TIME_DAMAGE = 4;
const SWEEPING_TIME_ID = 116_022;

// Sweeping Time, Noelle's elemental burst: 4 Geo DMG, and the character gains Sweeping Time. A character already holding it
// Has its rounds renewed rather than a second copy, so the Normal Attack bonus is not doubled (the wiki's Sweeping Time)
export const sweepingTimeSkill: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const user = side.characters.at(side.activeIndex);
    if (!user) return;
    const held = user.statuses.find(({ cardId }) => cardId === SWEEPING_TIME_ID);
    if (held) held.rounds = sweepingTime.initialRounds ?? held.rounds;
    else user.statuses.push(createGcgZoneCard(SWEEPING_TIME_ID, sweepingTime));
  },
  getDamage: () => ({ damageType: Element.Geo, value: SWEEPING_TIME_DAMAGE }),
};
