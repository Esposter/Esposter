import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { Element } from "#src/models/Element";
import { YAKSHAS_MASK_ID } from "#src/services/gcg/cards/yakshasMask";
import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";
import { takeOne } from "@esposter/shared";

const XIAO_ID = 1_504;
const BANE_OF_ALL_EVIL_ID = 15_043;
const LEMNISCATIC_WIND_CYCLING_ID = 15_042;

// Conqueror of Evil: Guardian Yaksha, Xiao's talent: equipped to her while she is active, it has her use Bane of All Evil at
// once. While she has Yaksha's Mask, her Lemniscatic Wind Cycling costs one Anemo die less, and each attachment of the mask
// allows that twice (the wiki's Conqueror of Evil: Guardian Yaksha (Equipment Card))
export const conquerorOfEvilGuardianYaksha: GcgCardModule = {
  ...createGcgTalentCard(XIAO_ID, BANE_OF_ALL_EVIL_ID),
  onCostPaid: ({ characterIndex, duel, sideIndex }) => {
    const mask = findYakshasMask(duel, sideIndex, characterIndex);
    if (mask) mask.usages -= 1;
  },
  reduceCost: ({ characterIndex, duel, sideIndex }, subject) => {
    if (subject.skill?.id !== LEMNISCATIC_WIND_CYCLING_ID) return undefined;
    const mask = findYakshasMask(duel, sideIndex, characterIndex);
    return mask && mask.usages > 0 ? { count: 1, element: Element.Anemo } : undefined;
  },
};

// The Yaksha's Mask attached to a character, if she has one
const findYakshasMask = (
  duel: GcgDuel,
  sideIndex: number,
  characterIndex: number | undefined,
): GcgZoneCard | undefined =>
  characterIndex === undefined
    ? undefined
    : takeOne(duel.sides, sideIndex)
        .characters.at(characterIndex)
        ?.statuses.find(({ cardId }) => cardId === YAKSHAS_MASK_ID);
