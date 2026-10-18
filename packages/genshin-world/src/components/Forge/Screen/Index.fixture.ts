import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { WORLD_RANDOM_SEED } from "#src/services/constants";
import { FORGE_DAILY_POINT_CAP, FORGE_ORE_ITEM_IDS } from "#src/services/forging/constants";
import { readForgeRecipes } from "#src/services/forging/readForgeRecipes";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { computeGameDay } from "#src/services/time/computeGameDay";
import { createSeededRandom } from "genshin-engine";
import { ForgeTab } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

const materialDataMap = await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL);
const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);
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
// The Enhancement Ore queue forging with its second unit half done, and the Adventure Rank that opens the third queue
const progress: ForgeProgress = {
  forgedPoints: 0,
  forgedPointsDay: gameDay,
  learnedRecipeIds: [],
  orders: [{ count: 5, queueId: 1, recipeId: 11_001, startedAt: now.subtract({ seconds: 6 }), unitSeconds: 3 }],
};

export const props = {
  adventureExp: 0,
  adventureRank: 10,
  adventureRankTables,
  amount: 5,
  completedMainQuestIds: new Set<string>(),
  definitions,
  gameText: ENGLISH_GAME_TEXT,
  inventory: { items: [], nextId: 1 },
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
// The Forge Queues tab, and the day's forge points spent to the cap, which refuses the Enhancement Ore in place of Start
export const variants = {
  queues: { tab: ForgeTab.Queues },
  refused: { progress: { ...progress, forgedPoints: FORGE_DAILY_POINT_CAP } },
};
