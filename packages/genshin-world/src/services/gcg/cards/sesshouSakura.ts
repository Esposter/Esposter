import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const SESSHOU_SAKURA_DAMAGE = 1;
const SESSHOU_SAKURA_MAX_USAGES = 6;
// The usages a Sesshou Sakura needs left to strike when its side declares the round's end
const SESSHOU_SAKURA_ROUND_END_USAGES = 4;

// Sesshou Sakura, a summon of three usages that stack up to six: at the End Phase it deals 1 Electro DMG and spends a usage.
// When its side declares the round's end with at least four usages left, it deals 1 Electro DMG and spends one (the wiki does
// Not print how many it spends there, so one is provisional). A Yakan Evocation's raised DMG adds 1 to each of its hits
export const sesshouSakura: GcgCardModule = {
  initialUsages: 3,
  maxUsages: SESSHOU_SAKURA_MAX_USAGES,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Electro, value: SESSHOU_SAKURA_DAMAGE + zoneCard.counter };
  },
  onRoundEndDeclared: (_context, zoneCard) => {
    if (zoneCard.usages < SESSHOU_SAKURA_ROUND_END_USAGES) return;
    zoneCard.usages -= 1;
    return { damageType: Element.Electro, value: SESSHOU_SAKURA_DAMAGE + zoneCard.counter };
  },
};
