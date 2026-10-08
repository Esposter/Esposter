import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ItemCategory } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The weapons' tab of the English client at 1080 high, holding 1,347 four-star weapons at level 20, the tab's room
// Counted beside its name (`Weapons 1347/2000`), as the recording of the account tour shows it
const WEAPON_COUNT = 1347;
const WEAPON_LEVEL = 20;
const WEAPON_RARITY = 4;
// The first entry is the one the detail panel shows, the Eye of Perception at level 50 as the recording's selected one is
const weapons: InventoryItem[] = Array.from({ length: WEAPON_COUNT }, (_, index) => ({
  definition: {
    category: ItemCategory.Weapon,
    id: index,
    name: index === 0 ? "Eye of Perception" : `Weapon ${index + 1}`,
    rank: index,
    rarity: WEAPON_RARITY,
    stackLimit: 1,
  },
  id: index,
  level: index === 0 ? 50 : WEAPON_LEVEL,
  quantity: 1,
}));

export const props = {
  gameText: ENGLISH_GAME_TEXT,
  inventory: { items: weapons, nextId: WEAPON_COUNT },
  wallet: EMPTY_WALLET,
};
