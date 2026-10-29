import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { InventorySort, ItemCategory } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The weapons' tab of the English client at 1080 high, holding 1,347 weapons, the tab's room counted beside its name
// (`Weapons 1347/2000`), sorted by quality as the recording of the account tour shows it: eleven five-star weapons at level 20 first, one at level 1,
// then the four-star ones, two at level 50 of which the first is The Eye of Perception the detail panel opens on, then five at 40
const WEAPON_COUNT = 1347;
const WEAPON_LEVEL = 20;
const WEAPON_RARITY = 4;
const EYE_OF_PERCEPTION_INDEX = 12;
const SHOWN_WEAPONS: { level: number; rarity: number }[] = [
  ...Array.from({ length: 11 }, () => ({ level: 20, rarity: 5 })),
  { level: 1, rarity: 5 },
  { level: 50, rarity: 4 },
  { level: 50, rarity: 4 },
  ...Array.from({ length: 5 }, () => ({ level: 40, rarity: 4 })),
];
const weapons: InventoryItem[] = Array.from({ length: WEAPON_COUNT }, (_value, index) => {
  const shown = SHOWN_WEAPONS.at(index);
  return {
    definition: {
      category: ItemCategory.Weapon,
      id: index,
      name: index === EYE_OF_PERCEPTION_INDEX ? "Eye of Perception" : `Weapon ${index + 1}`,
      rank: index,
      rarity: shown?.rarity ?? WEAPON_RARITY,
      stackLimit: 1,
    },
    id: index,
    level: shown?.level ?? WEAPON_LEVEL,
    quantity: 1,
  };
});

export const props = {
  // The weapons hold no cooking instruction and the cook has learned nothing, so the bag's Use check reads no dish
  cookingProgress: { learnedRecipeIds: [], proficiencies: {} },
  dishUseMap: new Map(),
  gadgetRows: [],
  gameText: ENGLISH_GAME_TEXT,
  initialCategory: ItemCategory.Weapon,
  initialSelectedId: String(EYE_OF_PERCEPTION_INDEX),
  initialSort: InventorySort.Quality,
  instructionRecipeMap: new Map(),
  inventory: { items: weapons, nextId: WEAPON_COUNT },
  materialDataMap: await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL),
  names: englishNameText,
  wallet: EMPTY_WALLET,
};
