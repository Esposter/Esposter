import type { Inventory } from "#src/models/inventory/Inventory";
import type { Weapon } from "#src/models/weapon/Weapon";

import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { readStatTables } from "#src/services/character/readStatTables";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { ENHANCEMENT_ORES } from "#src/services/weapon/constants";
import { readWeaponLevelRequiredExps } from "#src/services/weapon/readWeaponLevelRequiredExps";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { WeaponMenuTab } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const rarityRequiredExpsMap = await readWeaponLevelRequiredExps(GAME_DATA_LOCAL_BASE_URL);
const materialDataMap = await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL);

const getWeaponData = (id: number) => {
  const data = statTables.weaponDataMap.get(id);
  if (!data) throw new InvalidOperationError(Operation.Read, "weapon screen fixture", `weapon ${id} has no data`);
  return data;
};
// A five-star weapon held at level one in its first phase with no EXP, the weapon the screen opens on
const WEAPON_ID = 11516;
const weaponData = getWeaponData(WEAPON_ID);
const weapon: Weapon = { ascension: 0, experience: 0, id: WEAPON_ID, level: 1, refinement: 1 };
// A two-star weapon, which the game gives no refinement costs at all
const TWO_STAR_WEAPON_ID = 11201;
const twoStarWeapon: Weapon = { ...weapon, id: TWO_STAR_WEAPON_ID };
// Three of each enhancement ore in the bag, the bag otherwise empty
const inventory: Inventory = {
  items: ENHANCEMENT_ORES.map(({ id }, index) => ({
    definition: getItemDefinition(id, englishNameText, materialDataMap),
    id: index + 1,
    quantity: 3,
  })),
  nextId: ENHANCEMENT_ORES.length + 1,
};

export const props = {
  adventureRank: 30,
  gameText: ENGLISH_GAME_TEXT,
  inventory,
  materialDataMap,
  nameText: englishNameText,
  rarityRequiredExpsMap,
  tab: WeaponMenuTab.Enhance,
  wallet: { ...EMPTY_WALLET, [Currency.Mora]: 100_000 },
  weapon,
  weaponData,
};

// The same weapon at its phase's cap, where the Ascend tab is offered, and at refinement one with the Refine tab open
const nextPhase = weaponData.ascensionPhases[1];
const atCap = { ...weapon, level: weaponData.ascensionPhases[0]?.maxLevel ?? weapon.level };
// The bag and the wallet holding the next phase's items and Mora, and the Adventure Rank it requires
const ascendInventory: Inventory = {
  items: [
    ...inventory.items,
    ...(nextPhase?.costItems ?? []).map(({ count, id }, index) => ({
      definition: getItemDefinition(id, englishNameText, materialDataMap),
      id: inventory.nextId + index,
      quantity: count,
    })),
  ],
  nextId: inventory.nextId + (nextPhase?.costItems.length ?? 0),
};

export const variants = {
  ascend: {
    adventureRank: nextPhase?.requiredPlayerLevel ?? 0,
    inventory: ascendInventory,
    tab: WeaponMenuTab.Ascend,
    wallet: { ...EMPTY_WALLET, [Currency.Mora]: nextPhase?.coinCost ?? 0 },
    weapon: atCap,
  },
  atCap: { weapon: atCap },
  // A weapon at rank five, which no Refine tab is offered for
  rankFive: { weapon: { ...weapon, refinement: 5 } },
  // The two-star weapon, which no Refine tab is offered for
  twoStar: { weapon: twoStarWeapon, weaponData: getWeaponData(TWO_STAR_WEAPON_ID) },
};
