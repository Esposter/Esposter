import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import {
  SESSHOU_SAKURA_ID,
  TENKO_THUNDERBOLTS_ID,
  THE_SHRINES_SACRED_SHADE_ID,
} from "#src/services/gcg/cards/constants";
import { tenkoThunderbolts } from "#src/services/gcg/cards/tenkoThunderbolts";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const TENKO_KENSHIN_DAMAGE = 4;

// Great Secret Art: Tenko Kenshin, Yae Miko's Elemental Burst: 4 Electro DMG, and with a Sesshou Sakura on her side, it is
// Destroyed and Tenko Thunderbolts is created. When Yae Miko has The Shrine's Sacred Shade equipped, that talent's counter is
// Set to the round, so the next Yakan Evocation this round costs less
export const tenkoKenshin: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const sesshou = side.summons.find(({ cardId }) => cardId === SESSHOU_SAKURA_ID);
    if (!sesshou) return;
    sesshou.usages = 0;
    placeGcgZoneCard(side.onstages, TENKO_THUNDERBOLTS_ID, tenkoThunderbolts);
    const yae = side.characters.at(side.activeIndex);
    const shrine = yae?.equipments.find(({ cardId }) => cardId === THE_SHRINES_SACRED_SHADE_ID);
    if (shrine) shrine.counter = duel.round;
  },
  getDamage: () => ({ damageType: Element.Electro, value: TENKO_KENSHIN_DAMAGE }),
};
