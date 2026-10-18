import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GENERALS_WAR_BANNER_ID } from "#src/services/gcg/cards/generalsWarBanner";
import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";
import { drawGcgCards } from "#src/services/gcg/drawGcgCards";
import { takeOne } from "@esposter/shared";

export const RUSHING_HOUND_ID = 216_061;
const GOROU_ID = 1_606;
const INUZAKA_ALL_ROUND_DEFENSE_SKILL_ID = 16_062;

// Rushing Hound: Swift as the Wind, Gorou's Talent: it is equipped to her and uses her Elemental Skill at once. While it is
// On her, a skill of her side that deals Geo DMG draws a card while a General's War Banner is in play, once per Round
export const rushingHound: GcgCardModule = {
  ...createGcgTalentCard(GOROU_ID, INUZAKA_ALL_ROUND_DEFENSE_SKILL_ID),
  onAnySkillUsed: (context, _skill, _zoneCard, dealt) => {
    if (context.sideIndex !== context.userSideIndex || !dealt.some(({ damageType }) => damageType === Element.Geo))
      return;
    const side = takeOne(context.duel.sides, context.sideIndex);
    if (
      side.usedCardIds.includes(RUSHING_HOUND_ID) ||
      !side.onstages.some(({ cardId }) => cardId === GENERALS_WAR_BANNER_ID)
    )
      return;
    side.usedCardIds.push(RUSHING_HOUND_ID);
    drawGcgCards(side, 1, context.duel.rule.handCardLimit);
  },
};
