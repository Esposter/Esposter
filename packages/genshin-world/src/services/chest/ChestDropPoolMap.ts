import type { ChestDropPool } from "#src/models/chest/ChestDropPool";

import { ChestKind } from "#src/models/chest/ChestKind";
import {
  CHARACTER_EXP_ONE_STAR_ITEM_ID,
  CHARACTER_EXP_THREE_STAR_ITEM_ID,
  CHARACTER_EXP_TWO_STAR_ITEM_ID,
  CHEST_HIGH_RARITY_ARTIFACT_SET_IDS,
  CHEST_LOW_RARITY_ARTIFACT_SET_IDS,
  CHEST_ONE_STAR_WEAPON_ITEM_IDS,
} from "#src/services/chest/constants";

// What each chest tier pours out, from the wiki's Chests page: the one-star weapons Common and Exquisite chests name,
// The artifact sets and the Character EXP materials by star with their count ranges. Provisional: the wiki gives no
// Chance that a chest pours a weapon or an artifact, so each pool is taken as one roll per opening until a recording of
// Openings measures it. Precious names no weapon, so its weapon pool is empty; Luxurious and Remarkable pour nothing yet
export const ChestDropPoolMap: Partial<Record<ChestKind, ChestDropPool>> = {
  [ChestKind.Common]: {
    artifactSetIds: CHEST_LOW_RARITY_ARTIFACT_SET_IDS,
    materials: [
      { count: { max: 4, min: 4 }, itemId: CHARACTER_EXP_ONE_STAR_ITEM_ID },
      { count: { max: 3, min: 1 }, itemId: CHARACTER_EXP_TWO_STAR_ITEM_ID },
      { count: { max: 2, min: 0 }, itemId: CHARACTER_EXP_THREE_STAR_ITEM_ID },
    ],
    weaponItemIds: CHEST_ONE_STAR_WEAPON_ITEM_IDS,
  },
  [ChestKind.Exquisite]: {
    artifactSetIds: [...CHEST_LOW_RARITY_ARTIFACT_SET_IDS, ...CHEST_HIGH_RARITY_ARTIFACT_SET_IDS],
    materials: [
      { count: { max: 3, min: 0 }, itemId: CHARACTER_EXP_TWO_STAR_ITEM_ID },
      { count: { max: 2, min: 0 }, itemId: CHARACTER_EXP_THREE_STAR_ITEM_ID },
    ],
    weaponItemIds: CHEST_ONE_STAR_WEAPON_ITEM_IDS,
  },
  [ChestKind.Precious]: {
    artifactSetIds: [...CHEST_LOW_RARITY_ARTIFACT_SET_IDS, ...CHEST_HIGH_RARITY_ARTIFACT_SET_IDS],
    materials: [
      { count: { max: 1, min: 0 }, itemId: CHARACTER_EXP_TWO_STAR_ITEM_ID },
      { count: { max: 1, min: 0 }, itemId: CHARACTER_EXP_THREE_STAR_ITEM_ID },
    ],
    weaponItemIds: [],
  },
};
