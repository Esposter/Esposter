import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { InventorySort, ItemCategory } from "genshin-interface";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";

// The weapons' tab of the English client at 1080 high, holding 1,347 weapons, is sorted by quality.
// Its room is counted beside its name, as in `Weapons 1347/2000`, and the account tour's recording shows that order.
// Eleven five-star weapons at level 20 come first, then one at level 1.
// The four-star ones follow: two at level 50, the first of which is The Eye of Perception the detail panel opens on.
// Five more follow at level 40.
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
  // The Eye of Perception's panel as the reference shows it, its words the game's own, its passive and description read off it
  weaponDetails: {
    [String(EYE_OF_PERCEPTION_INDEX)]: {
      baseAttack: { label: ENGLISH_GAME_TEXT[GameTextKey.AttributeBaseAttack], value: "238" },
      description: "A dim black glaze pearl that is said to have the power to read the purity of one's heart.",
      kind: ENGLISH_GAME_TEXT[GameTextKey.WeaponTypeCatalyst],
      passiveName: "Echo",
      passiveText:
        "· Normal and Charged Attacks have a 50% chance to fire a Bolt of Perception, dealing 360% ATK as DMG. This bolt can bounce between opponents a maximum of 4 times. This effect can occur once every 8s.",
      refinement: 5,
      secondaryStat: { label: ENGLISH_GAME_TEXT[GameTextKey.AttributeAttack], value: "35.7%" },
    },
  },
};
