import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { takeOne } from "@esposter/shared";

export const EMBLEM_OF_SEVERED_FATE_ID = 312_008;
const EMBLEM_OF_SEVERED_FATE_BONUS = 2;

// Emblem of Severed Fate, an artifact on a character: once a round her Elemental Burst deals 2 more DMG, and after another
// Character of hers uses an Elemental Burst, she gains 1 Energy
export const emblemOfSeveredFate: GcgCardModule = {
  modifyDamageDealt: ({ duel, sideIndex, skill }, damage, zoneCard) =>
    skill?.kind === GcgSkillKind.ElementalBurst && !takeOne(duel.sides, sideIndex).usedCardIds.includes(zoneCard.cardId)
      ? { ...damage, value: damage.value + EMBLEM_OF_SEVERED_FATE_BONUS }
      : damage,
  onAnySkillUsed: ({ characterIndex, duel, sideIndex, userSideIndex }, skill) => {
    if (skill.kind !== GcgSkillKind.ElementalBurst || characterIndex === undefined || userSideIndex !== sideIndex)
      return;
    const side = takeOne(duel.sides, sideIndex);
    const userIndex = side.characters.findIndex(({ character }) => character.skills.some(({ id }) => id === skill.id));
    if (userIndex < 0 || userIndex === characterIndex) return;
    const owner = takeOne(side.characters, characterIndex);
    owner.energy = Math.min(owner.energy + 1, owner.character.maxEnergy);
  },
  onSkillUsed: ({ duel, sideIndex }, skill, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    if (skill.kind === GcgSkillKind.ElementalBurst && !side.usedCardIds.includes(zoneCard.cardId))
      side.usedCardIds.push(zoneCard.cardId);
  },
};
