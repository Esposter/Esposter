import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDealtDamage } from "#src/models/gcg/GcgDealtDamage";

import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { drawGcgCards } from "#src/services/gcg/drawGcgCards";
import { takeOne } from "@esposter/shared";

const INSPIRATION_TO_DISCARD = 3;
const CARDS_TO_DRAW = 2;

// Whether a hit a skill dealt is Physical or Piercing DMG, or triggered an Elemental Reaction
const checkIsGcgInspiringHit = (hit: GcgDealtDamage): boolean =>
  hit.damageType === GcgDamageKind.Physical || hit.damageType === GcgDamageKind.Piercing || hit.reaction !== undefined;

// Chang the Ninth: after either side uses a Skill that deals Physical or Piercing DMG, or triggers an Elemental Reaction, it
// Gains one Inspiration, once for the skill. At three Inspiration it is discarded, and its side draws two cards
export const changTheNinth: GcgCardModule = {
  initialUsages: 1,
  onAnySkillUsed: ({ duel, sideIndex }, _skill, zoneCard, dealt) => {
    if (!dealt.some((hit) => checkIsGcgInspiringHit(hit))) return;
    zoneCard.counter += 1;
    if (zoneCard.counter < INSPIRATION_TO_DISCARD) return;
    zoneCard.usages = 0;
    drawGcgCards(takeOne(duel.sides, sideIndex), CARDS_TO_DRAW, duel.rule.handCardLimit);
  },
};
