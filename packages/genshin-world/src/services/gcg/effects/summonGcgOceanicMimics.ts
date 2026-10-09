import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { oceanicMimicFrog } from "#src/services/gcg/cards/oceanicMimicFrog";
import { oceanicMimicRaptor } from "#src/services/gcg/cards/oceanicMimicRaptor";
import { oceanicMimicSquirrel } from "#src/services/gcg/cards/oceanicMimicSquirrel";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

// The three kinds of Oceanic Mimic by the card each is in the game's table, in the order a tie between them is broken
const OCEANIC_MIMIC_KINDS: [number, GcgCardModule][] = [
  [122_011, oceanicMimicSquirrel],
  [122_012, oceanicMimicRaptor],
  [122_013, oceanicMimicFrog],
];

// Summons the given number of Oceanic Mimics, each of the kind fewest on the side's field, so the summons differ where
// They can. A duel holds no random source the skill's effect reaches, so the choice the game makes at random is this rule
export const summonGcgOceanicMimics = (side: GcgSideState, count: number): void => {
  const countKind = (cardId: number): number => side.summons.filter((zoneCard) => zoneCard.cardId === cardId).length;
  for (let summoned = 0; summoned < count; summoned++) {
    const [cardId, module] = OCEANIC_MIMIC_KINDS.reduce((fewest, kind) =>
      countKind(kind[0]) < countKind(fewest[0]) ? kind : fewest,
    );
    side.summons.push(createGcgZoneCard(cardId, module));
  }
};
