import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { countGcgCardUses } from "#src/services/gcg/effects/countGcgCardUses";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

export const ADVENTURERS_BANDANA_ID = 312_001;
const ADVENTURERS_BANDANA_HEAL = 1;
const ADVENTURERS_BANDANA_HEALS_PER_ROUND = 3;

// Adventurer's Bandana, an artifact: after its character uses a Normal Attack, it heals that character for 1 HP, up to three
// times per Round (the wiki's Adventurer's Bandana (Equipment Card))
export const adventurersBandana: GcgCardModule = {
  onSkillUsed: ({ characterIndex, duel, sideIndex }, skill) => {
    if (skill.kind !== GcgSkillKind.NormalAttack || characterIndex === undefined) return;
    const side = takeOne(duel.sides, sideIndex);
    if (countGcgCardUses(side, ADVENTURERS_BANDANA_ID) >= ADVENTURERS_BANDANA_HEALS_PER_ROUND) return;
    side.usedCardIds.push(ADVENTURERS_BANDANA_ID);
    healGcgCharacter(takeOne(side.characters, characterIndex), ADVENTURERS_BANDANA_HEAL);
  },
};
