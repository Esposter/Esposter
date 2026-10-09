<script setup lang="ts">
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { CraftingCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { Currency } from "#src/models/inventory/Currency";
import { checkIsRecipeOpen } from "#src/services/crafting/checkIsRecipeOpen";
import { CombineTypeGameTextKeyMap } from "#src/services/crafting/CombineTypeGameTextKeyMap";
import { computeCraftableCount } from "#src/services/crafting/computeCraftableCount";
import { craftRecipe } from "#src/services/crafting/craftRecipe";
import { rollCraftingTalent } from "#src/services/crafting/rollCraftingTalent";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { getItemName } from "#src/services/inventory/getItemName";
import { takeOne } from "@esposter/shared";
import { CraftingScreen, GameScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The Adventure Rank the player has reached, which opens the recipes that name one
  adventureRank: number;
  // The party's characters who can craft, the one picked cooking each craft's talent
  crafters: CraftingCell[];
  // The game's words in the reader's language
  gameText: GameText;
  // The game's material table by item id, which each crafted item is defined from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names of the items and recipes in the reader's language, by their game text ids
  nameText: Readonly<Record<string, string>>;
  // What the player has learned from instructions
  progress: CraftingProgress;
  // The world's seeded random source, which each craft's talent draws from
  random: () => number;
  // Every recipe the bench holds, in the game's order; the ones the player has not opened are not offered
  recipes: CraftingRecipe[];
}

const { adventureRank, crafters, gameText, materialDataMap, nameText, progress, random, recipes } =
  defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const inventory = defineModel<Inventory>("inventory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
// How many of each recipe the player has crafted, by the recipe's id, which the Crafting Performed line counts
const craftedCountMap = defineModel<ReadonlyMap<number, number>>("craftedCountMap", { required: true });
const amount = ref(1);
const crafterId = ref(0);
const recipeId = ref(0);
const tabId = ref(0);
const openRecipes = computed(() => recipes.filter((recipe) => checkIsRecipeOpen(recipe, progress, adventureRank)));
// One tab per combine type the open recipes fall under, in the table's order and named by the game's own text
const tabCells = computed(() =>
  [...new Set(openRecipes.value.map((recipe) => recipe.combineType))]
    .toSorted((firstCombineType, secondCombineType) => firstCombineType - secondCombineType)
    .map((combineType) => ({ id: combineType, name: gameText[takeOne(CombineTypeGameTextKeyMap, combineType)] })),
);
// The tab the player picked, or the first tab while none is picked
const pickedTabId = computed(() =>
  tabCells.value.some((tab) => tab.id === tabId.value) ? tabId.value : (tabCells.value.at(0)?.id ?? 0),
);
const tabRecipes = computed(() => openRecipes.value.filter((recipe) => recipe.combineType === pickedTabId.value));
const recipeCells = computed(() =>
  tabRecipes.value.map((recipe) => ({ id: recipe.id, name: getItemName(recipe.nameTextId, nameText) })),
);
// The recipe the player picked in the tab, or the tab's first while none of its own is picked
const pickedRecipe = computed(
  () => tabRecipes.value.find((recipe) => recipe.id === recipeId.value) ?? tabRecipes.value.at(0),
);
// The most the bag and wallet pay for, and never less than one so the slider still reads as a count
const amountMaximum = computed(() => {
  if (!pickedRecipe.value) return 1;
  return Math.max(
    computeCraftableCount(
      pickedRecipe.value,
      { inventory: inventory.value, wallet: wallet.value },
      Temporal.Now.instant(),
    ),
    1,
  );
});
// The amount the player picked, kept to the most the bag and wallet still pay for once a craft has spent them
const pickedAmount = computed(() => Math.min(amount.value, amountMaximum.value));
const requiredCoins = computed(() => (pickedRecipe.value?.mora ?? 0) * pickedAmount.value);
const craftedLabel = computed(() =>
  fillGameTextValues(
    gameText[GameTextKey.CraftingCrafted],
    craftedCountMap.value.get(pickedRecipe.value?.id ?? 0) ?? 0,
  ),
);
// The picked recipe's results, rolled through the crafter's talent: the bag and wallet after the craft, with the
// Talent's extra items put in the bag after the craft's own results, one that finds no room left out
const craft = () => {
  const recipe = pickedRecipe.value;
  if (!recipe) return;
  const craftCount = pickedAmount.value;
  const crafted = craftRecipe(recipe, craftCount, getItemDefinition(recipe.resultItemId, nameText, materialDataMap), {
    adventureRank,
    inventory: inventory.value,
    now: Temporal.Now.instant(),
    progress,
    wallet: wallet.value,
  });
  if (!crafted) return;
  inventory.value = rollCraftingTalent(crafterId.value, recipe, craftCount, random).reduce(
    (bag, { count, id }) => addInventoryItem(bag, getItemDefinition(id, nameText, materialDataMap), count).inventory,
    crafted.inventory,
  );
  wallet.value = crafted.wallet;
  const craftedCount = craftedCountMap.value.get(recipe.id) ?? 0;
  craftedCountMap.value = new Map(craftedCountMap.value).set(recipe.id, craftedCount + craftCount);
};
</script>

<template>
  <!-- The crafting bench, opened by an NPC or a world object: the recipes it holds open, the picked one's count and cost,
       and the party's crafter who may pass a talent's extra on to the bag -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.CraftingTitle]">
    <CraftingScreen
      v-model:crafter-id="crafterId"
      :amount="pickedAmount"
      :amount-label="gameText[GameTextKey.CraftingAmount]"
      :amount-maximum
      :close-label="gameText[GameTextKey.Back]"
      :coins="wallet[Currency.Mora]"
      :crafted-label
      :crafting-materials-label="gameText[GameTextKey.CraftingMaterials]"
      :craft-label="gameText[GameTextKey.CraftingTitle]"
      :crafters
      :recipe-id="pickedRecipe?.id ?? 0"
      :recipes="recipeCells"
      :required-coins
      :required-label="gameText[GameTextKey.CraftingRequired]"
      :tab-id="pickedTabId"
      :tabs="tabCells"
      :title="gameText[GameTextKey.CraftingTitle]"
      @close="emit('close')"
      @update:amount="amount = $event"
      @update:recipe-id="recipeId = $event"
      @update:tab-id="tabId = $event"
      @craft="craft()"
    />
  </GameScreen>
</template>
