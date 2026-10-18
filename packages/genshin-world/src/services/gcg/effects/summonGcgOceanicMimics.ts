import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { OCEANIC_MIMIC_FROG_ID, oceanicMimicFrog } from "#src/services/gcg/cards/oceanicMimicFrog";
import { OCEANIC_MIMIC_RAPTOR_ID, oceanicMimicRaptor } from "#src/services/gcg/cards/oceanicMimicRaptor";
import { OCEANIC_MIMIC_SQUIRREL_ID, oceanicMimicSquirrel } from "#src/services/gcg/cards/oceanicMimicSquirrel";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";

// The three kinds of Oceanic Mimic by the card each is in the game's table, in the order a tie between them is broken
const OCEANIC_MIMIC_KINDS: [number, GcgCardModule][] = [
  [OCEANIC_MIMIC_SQUIRREL_ID, oceanicMimicSquirrel],
  [OCEANIC_MIMIC_RAPTOR_ID, oceanicMimicRaptor],
  [OCEANIC_MIMIC_FROG_ID, oceanicMimicFrog],
];

// Summons the given number of Oceanic Mimics, each of the kind fewest on the side's field, so the summons differ where
// They can. The game chooses the kinds at random, and this rule stands in for that choice as a provisional call
export const summonGcgOceanicMimics = (side: GcgSideState, count: number): void => {
  const countKind = (cardId: number): number => side.summons.filter((zoneCard) => zoneCard.cardId === cardId).length;
  for (let summoned = 0; summoned < count; summoned++) {
    const [cardId, module] = OCEANIC_MIMIC_KINDS.reduce((fewest, kind) =>
      countKind(kind[0]) < countKind(fewest[0]) ? kind : fewest,
    );
    placeGcgZoneCard(side.summons, cardId, module);
  }
};
