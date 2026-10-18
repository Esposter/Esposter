import { COLLECTED_ENCOUNTER_HALF_POINTS, COLLECTED_ENCOUNTER_ITEM_IDS } from "#src/services/commission/constants";

// The half points an item collected in the world earns, by the id its quest objective names it with: the items the wiki lists
// Give a half point each, and any other item gives none
export const getCollectedEncounterHalfPoints = (itemId: string): number =>
  COLLECTED_ENCOUNTER_ITEM_IDS.has(itemId) ? COLLECTED_ENCOUNTER_HALF_POINTS : 0;
