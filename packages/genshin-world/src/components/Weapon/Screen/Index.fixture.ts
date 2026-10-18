import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { Weapon } from "#src/models/weapon/Weapon";

import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { readStatTables } from "#src/services/character/readStatTables";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { toWeaponDefinition } from "#src/services/inventory/toWeaponDefinition";
import { ENHANCEMENT_ORES } from "#src/services/weapon/constants";
import { readWeaponLevelRequiredExps } from "#src/services/weapon/readWeaponLevelRequiredExps";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { WeaponMenuTab } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const rarityRequiredExpsMap = await readWeaponLevelRequiredExps(GAME_DATA_LOCAL_BASE_URL);
const materialDataMap = await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL);
const { weaponDataMap } = statTables;

const getWeaponData = (id: number) => {
  const data = weaponDataMap.get(id);
  if (!data) throw new InvalidOperationError(Operation.Read, "weapon screen fixture", `weapon ${id} has no data`);
  return data;
};
// A five-star weapon, the weapon the screen opens on
const WEAPON_ID = 11516;
export const weaponData = getWeaponData(WEAPON_ID);
// A two-star weapon, which the game gives no refinement costs at all
const TWO_STAR_WEAPON_ID = 11201;
// A three-star weapon the bag holds as fodder
const fodderWeaponData = [...weaponDataMap.values()].find((data) => data.rarity === 3);
if (!fodderWeaponData) throw new InvalidOperationError(Operation.Read, "weapon screen fixture", "no three-star weapon");
// The largest ore, which an Enhance picks, by its item id and its name in English
export const ORE_ID = 104013;
export const oreName = getItemDefinition(ORE_ID, englishNameText, materialDataMap).name;
export const fodderName = englishNameText[fodderWeaponData.nameTextId] ?? "";
// The bag entries of the open weapon, the ores, the fodder and the copy, which the screen tells apart by these ids
export const OPEN_ENTRY_ID = 0;
export const FODDER_ENTRY_ID = 4;
export const COPY_ENTRY_ID = 5;
const NEXT_ENTRY_ID = 6;

// The open weapon at level one in its first phase with no EXP, and a copy of it at the level cap in the bag
const openWeapon: Weapon = { ascension: 0, experience: 0, id: WEAPON_ID, level: 1, refinement: 1 };
export const atCapWeapon: Weapon = {
  ...openWeapon,
  level: weaponData.ascensionPhases[0]?.maxLevel ?? openWeapon.level,
};
const copyWeapon: Weapon = atCapWeapon;
const fodderWeapon: Weapon = { ascension: 0, experience: 0, id: fodderWeaponData.id, level: 3, refinement: 1 };

// A weapon in the bag as its entry holds it, named in English
const toWeaponEntry = (weapon: Weapon, entryId: number): InventoryItem => {
  const data = getWeaponData(weapon.id);
  return {
    ascension: weapon.ascension,
    definition: toWeaponDefinition(data, englishNameText[data.nameTextId] ?? ""),
    experience: weapon.experience,
    id: entryId,
    level: weapon.level,
    quantity: 1,
    refinement: weapon.refinement,
  };
};
// Three of each enhancement ore in the bag, beside the weapons
const oreItems: InventoryItem[] = ENHANCEMENT_ORES.map(({ id }, index) => ({
  definition: getItemDefinition(id, englishNameText, materialDataMap),
  id: index + 1,
  quantity: 3,
}));
// The bag holding the open weapon in the given state, the ores, one fodder weapon and one copy of the open weapon
const createBag = (openEntry: Weapon): Inventory => ({
  items: [
    toWeaponEntry(openEntry, OPEN_ENTRY_ID),
    ...oreItems,
    toWeaponEntry(fodderWeapon, FODDER_ENTRY_ID),
    toWeaponEntry(copyWeapon, COPY_ENTRY_ID),
  ],
  nextId: NEXT_ENTRY_ID,
  quickSwapItemIds: [],
});
const bag = createBag(openWeapon);

export const props = {
  adventureRank: 30,
  entryId: OPEN_ENTRY_ID,
  gameText: ENGLISH_GAME_TEXT,
  inventory: bag,
  materialDataMap,
  nameText: englishNameText,
  rarityRequiredExpsMap,
  tab: WeaponMenuTab.Enhance,
  wallet: { ...EMPTY_WALLET, [Currency.Mora]: 100_000 },
  weaponDataMap,
};

// The bag at the cap, and the same bag with the next phase's items held, with the Mora and the Adventure Rank it requires
const nextPhase = weaponData.ascensionPhases[1];
const atCapBag = createBag(atCapWeapon);
const ascendInventory: Inventory = {
  items: [
    ...atCapBag.items,
    ...(nextPhase?.costItems ?? []).map(({ count, id }, index) => ({
      definition: getItemDefinition(id, englishNameText, materialDataMap),
      id: atCapBag.nextId + index,
      quantity: count,
    })),
  ],
  nextId: atCapBag.nextId + (nextPhase?.costItems.length ?? 0),
  quickSwapItemIds: [],
};

export const variants = {
  ascend: {
    adventureRank: nextPhase?.requiredPlayerLevel ?? 0,
    inventory: ascendInventory,
    tab: WeaponMenuTab.Ascend,
    wallet: { ...EMPTY_WALLET, [Currency.Mora]: nextPhase?.coinCost ?? 0 },
  },
  atCap: { inventory: atCapBag },
  // A weapon at rank five, which no Refine tab is offered for
  rankFive: { inventory: createBag({ ...openWeapon, refinement: 5 }) },
  // The Refine tab open, with the copy in the bag to pick
  refine: { tab: WeaponMenuTab.Refine },
  // The two-star weapon, which no Refine tab is offered for
  twoStar: { inventory: createBag({ ...openWeapon, id: TWO_STAR_WEAPON_ID }) },
};
