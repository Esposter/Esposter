import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";

import { attachGcgAegisOfAbyssalFlame } from "#src/services/gcg/cards/aegisOfAbyssalFlame";
import { EMBERS_REKINDLED_ID, FIERY_REBIRTH_ID } from "#src/services/gcg/cards/constants";
import { takeOne } from "@esposter/shared";

// Embers Rekindled, Abyss Lector's talent: once its character has triggered Fiery Rebirth, whether when the card is played on it
// Or when the character triggers it, the card is discarded and the character gains the Aegis of Abyssal Flame (the wiki's
// Embers Rekindled). The card's single usage marks it discarded
export const embersRekindled: GcgCardModule = {
  initialUsages: 1,
  onDefeatReplaced: ({ characterIndex, duel, sideIndex }, zoneCard) => {
    if (characterIndex === undefined) return;
    const character = takeOne(takeOne(duel.sides, sideIndex).characters, characterIndex);
    if (!checkIsFieryRebirthTriggered(character)) return;
    zoneCard.usages = 0;
    attachGcgAegisOfAbyssalFlame(character);
  },
  play: ({ duel, sideIndex }, targetIndex) => {
    if (targetIndex === undefined) return;
    const character = takeOne(takeOne(duel.sides, sideIndex).characters, targetIndex);
    const zoneCard = character.equipments.find(({ cardId }) => cardId === EMBERS_REKINDLED_ID);
    if (!zoneCard || !checkIsFieryRebirthTriggered(character)) return;
    zoneCard.usages = 0;
    attachGcgAegisOfAbyssalFlame(character);
  },
};

const checkIsFieryRebirthTriggered = (character: GcgCharacterState): boolean =>
  character.statuses.some(({ cardId, counter }) => cardId === FIERY_REBIRTH_ID && counter > 0);
