import type { ForgeTalent } from "#src/models/forging/ForgeTalent";

import { ForgeTalentKind } from "#src/models/forging/ForgeTalentKind";

// The forge type of the enhancement ores, the forge type the talents of Venti and Bennett apply to
export const FORGE_ENHANCEMENT_TYPE = 1;
// The ores a weapon's forge refunds its share of, the forge's own ore items from Normal to Mystic Enhancement Ore's
// Inputs
export const FORGE_ORE_ITEM_IDS: readonly number[] = [
  101_001, 101_002, 101_003, 101_004, 101_005, 101_006, 101_007, 101_008, 101_009, 101_010,
];
// The Magical Crystal Chunk, which the Serenitea Pot's forge refuses to take
export const MAGICAL_CRYSTAL_CHUNK_ITEM_ID = 101_004;
// The item a forge result gives as Adventure EXP: a virtual item the Adventure Rank takes, never the bag
export const ADVENTURE_EXP_ITEM_ID = 102;
// The forging talent each character's passive gives, by the character's id, from the game's proud skill and skill depot
// Tables. Each talent's ratio is the game's own: the extra result's chance of 2000 in 10000, the ore share of 0.15 and
// The Seconds of 0.2 saved
export const AvatarIdForgeTalentMap: Record<number, ForgeTalent> = {
  10_000_016: { forgeType: 5, kind: ForgeTalentKind.RefundOre, ratio: 0.15 },
  10_000_022: { forgeType: FORGE_ENHANCEMENT_TYPE, kind: ForgeTalentKind.ReduceTime, ratio: 0.2 },
  10_000_030: { forgeType: 7, kind: ForgeTalentKind.RefundOre, ratio: 0.15 },
  10_000_032: { forgeType: FORGE_ENHANCEMENT_TYPE, kind: ForgeTalentKind.ExtraResult, ratio: 0.2 },
  10_000_037: { forgeType: 4, kind: ForgeTalentKind.RefundOre, ratio: 0.15 },
};
// The scene's building point of Mondstadt's blacksmith, by its point id: the `Blacksmith` the scene marks its forge
// With, Beside the restaurant's point, which the scene group record holds among its buildings
export const MONDSTADT_BLACKSMITH_POINT_ID = "65";
// The blacksmith's interactable id, the row the forge screen opens from beside its place
export const FORGE_INTERACTABLE_ID = "blacksmith";
// The recipe the forge opens on, the first enhancement ore's
export const FIRST_FORGE_RECIPE_ID = 11_001;
// The milliseconds between each reading of the clock while the forge screen is open, so its queues' time left moves
export const FORGE_CLOCK_INTERVAL_MS = 1000;
