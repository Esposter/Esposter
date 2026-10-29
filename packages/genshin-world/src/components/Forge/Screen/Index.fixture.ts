import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { Currency } from "#src/models/inventory/Currency";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { readStatTables } from "#src/services/character/readStatTables";
import { WORLD_RANDOM_SEED } from "#src/services/constants";
import { FORGE_DAILY_POINT_CAP, FORGE_ORE_ITEM_IDS } from "#src/services/forging/constants";
import { readForgeRecipes } from "#src/services/forging/readForgeRecipes";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { toWeaponDefinition } from "#src/services/inventory/toWeaponDefinition";
import { computeGameDay } from "#src/services/time/computeGameDay";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { ForgeTab } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

const materialDataMap = await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL);
const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);
const { weaponDataMap } = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
// The three enhancement ores' recipes the Materials tab lists, in the game's order
const recipes: ForgeRecipe[] = (await readForgeRecipes(GAME_DATA_LOCAL_BASE_URL)).filter(({ id }) =>
  [11_001, 11_002, 11_003].includes(id),
);
const definitions = new Map<number, ItemDefinition>(
  [...FORGE_ORE_ITEM_IDS, ...recipes.flatMap(({ results }) => results.map(({ itemId }) => itemId))]
    .filter((itemId) => materialDataMap.has(itemId))
    .map((itemId): [number, ItemDefinition] => [itemId, getItemDefinition(itemId, englishNameText, materialDataMap)]),
);
// The moment the queues are read at, and the game day it falls on, which the forge points counted today are kept under
const now = Temporal.Instant.fromEpochMilliseconds(0);
const gameDay = computeGameDay(now);
// The Enhancement Ore queue forging its fifth unit, four done and two seconds left in it, and the Adventure Rank that opens
// The third queue
const UNIT_SECONDS = 3;
const progress: ForgeProgress = {
  forgedPoints: 0,
  forgedPointsDay: gameDay,
  learnedRecipeIds: [],
  orders: [
    { count: 5, queueId: 1, recipeId: 11_001, startedAt: now.subtract({ seconds: 13 }), unitSeconds: UNIT_SECONDS },
  ],
};

// A four-star weapon the forge yields, and a three-star weapon the bag already holds, whose entry the order's weapons are
// Told from
const getWeaponData = (rarity: number) => {
  const weaponData = [...weaponDataMap.values()].find((data) => data.rarity === rarity);
  if (!weaponData)
    throw new InvalidOperationError(Operation.Read, "forge screen fixture", `no ${rarity}-star weapon in the tables`);
  return weaponData;
};
export const FORGED_WEAPON_RARITY = 4;
const forgedWeaponData = getWeaponData(FORGED_WEAPON_RARITY);
const heldWeaponData = getWeaponData(3);
const weaponRecipe: ForgeRecipe = {
  ...takeOne(recipes, 0),
  id: 12_001,
  kind: ForgeRecipeKind.Weapon,
  results: [{ count: 1, itemId: forgedWeaponData.id, weight: 1 }],
};
const heldWeaponEntry: InventoryItem = {
  ascension: 0,
  definition: toWeaponDefinition(heldWeaponData, ""),
  experience: 0,
  id: 0,
  level: 1,
  quantity: 1,
  refinement: 1,
};
// An order of `count` units of the recipe, every unit done by `now`, in the Forge Queues tab above a bag holding the weapon
const createDoneOrderVariant = (recipeId: number, count: number) => ({
  inventory: { items: [heldWeaponEntry], nextId: 1, quickSwapItemIds: [] },
  progress: {
    ...progress,
    orders: [
      {
        count,
        queueId: 1,
        recipeId,
        startedAt: now.subtract({ seconds: count * UNIT_SECONDS }),
        unitSeconds: UNIT_SECONDS,
      },
    ],
  },
  tab: ForgeTab.Queues,
});

export const props = {
  adventureExp: 0,
  adventureRank: 10,
  adventureRankTables,
  amount: 5,
  completedMainQuestIds: new Set<string>(),
  definitions,
  gameText: ENGLISH_GAME_TEXT,
  inventory: { items: [], nextId: 1, quickSwapItemIds: [] },
  isInRealm: false,
  now,
  partyCharacterIds: [],
  progress,
  random: createSeededRandom(WORLD_RANDOM_SEED),
  recipeId: 11_001,
  recipes,
  tab: ForgeTab.Materials,
  wallet: { ...EMPTY_WALLET, [Currency.Mora]: 375_527 },
  weapons: new Map(),
};
// The Forge Queues tab, and the day's forge points spent to the cap, which refuses the Enhancement Ore in place of Start,
// And the Queues tab holding a finished order of the first ore's recipe or of the four-star weapon's
export const variants = {
  oresDone: createDoneOrderVariant(takeOne(recipes, 0).id, 5),
  queues: { tab: ForgeTab.Queues },
  refused: { progress: { ...progress, forgedPoints: FORGE_DAILY_POINT_CAP } },
  weaponsDone: {
    ...createDoneOrderVariant(weaponRecipe.id, 2),
    recipes: [...recipes, weaponRecipe],
    weapons: new Map([[forgedWeaponData.id, { ...forgedWeaponData, name: "" }]]),
  },
};
