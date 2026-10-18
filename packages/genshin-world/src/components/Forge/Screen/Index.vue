<script setup lang="ts">
import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { ForgeQueueCell, ForgeRecipeCell, ForgeTab } from "genshin-interface";
import type { GameText } from "genshin-text";

import { Currency } from "#src/models/inventory/Currency";
import { checkIsForgeRecipeOpen } from "#src/services/forging/checkIsForgeRecipeOpen";
import { computeForgeQueueSlots } from "#src/services/forging/computeForgeQueueSlots";
import { computeForgeRefusalLabel } from "#src/services/forging/computeForgeRefusalLabel";
import { computeForgeTalents } from "#src/services/forging/computeForgeTalents";
import { SECONDS_PER_MINUTE } from "#src/services/forging/constants";
import { obtainForgeOrder } from "#src/services/forging/obtainForgeOrder";
import { startForge } from "#src/services/forging/startForge";
import { takeOne } from "@esposter/shared";
import { ForgeQueueState, ForgeScreen, GameScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  adventureRank: number;
  adventureRankTables: AdventureRankTables;
  completedMainQuestIds: ReadonlySet<string>;
  // The items the forge yields and refunds, by their item ids
  definitions: Map<number, ItemDefinition>;
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the player is in the Serenitea Pot's realm, which refuses a recipe that takes a Magical Crystal Chunk
  isInRealm: boolean;
  // The moment the queues are read at, so a queue's time left and its units done are of this moment
  now: Temporal.Instant;
  // The party's characters, whose forging talents apply to the orders started and obtained here
  partyCharacterIds: number[];
  // The world's seeded random source, which each unit's result is drawn from
  random: () => number;
  // Every recipe the forge holds, in the game's order; the ones the player has not opened are shown disabled
  recipes: ForgeRecipe[];
  // The four-star weapons by their item ids, which a weapon recipe yields as a weapon
  weapons: Map<number, Pick<ItemDefinition, "name"> & WeaponData>;
}

const adventureExp = defineModel<number>("adventureExp", { required: true });
const amount = defineModel<number>("amount", { required: true });
const inventory = defineModel<Inventory>("inventory", { required: true });
const progress = defineModel<ForgeProgress>("progress", { required: true });
const recipeId = defineModel<number>("recipeId", { required: true });
const tab = defineModel<ForgeTab>("tab", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const {
  adventureRank,
  adventureRankTables,
  completedMainQuestIds,
  definitions,
  gameText,
  isInRealm,
  now,
  partyCharacterIds,
  random,
  recipes,
  weapons,
} = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// A duration in the game's own shape: seconds under a minute, then whole minutes
const formatForgeTime = (seconds: number) =>
  seconds < SECONDS_PER_MINUTE ? `${seconds}s` : `${Math.floor(seconds / SECONDS_PER_MINUTE)}m`;
// A recipe is named by the item it yields first: a weapon by its weapon, and the rest by their item
const getRecipeName = ({ results }: ForgeRecipe) => {
  const { itemId } = takeOne(results, 0);
  return definitions.get(itemId)?.name ?? weapons.get(itemId)?.name ?? "";
};
const recipeNameMap = computed(
  () => new Map(recipes.map((recipe): [number, string] => [recipe.id, getRecipeName(recipe)])),
);
const recipeCells = computed<ForgeRecipeCell[]>(() =>
  recipes.map((recipe) => ({
    forgeTimeLabel: fillGameTextValues(gameText[GameTextKey.ForgeItemTime], formatForgeTime(recipe.seconds)),
    id: recipe.id,
    isOpen: checkIsForgeRecipeOpen(recipe, progress.value, adventureRank),
    name: getRecipeName(recipe),
  })),
);
const pickedRecipe = computed(() => recipes.find((recipe) => recipe.id === recipeId.value));
const amountMaximum = computed(() => pickedRecipe.value?.queueSize ?? 1);
const requiredCoins = computed(() => (pickedRecipe.value?.mora ?? 0) * amount.value);
const totalSeconds = computed(() => (pickedRecipe.value?.seconds ?? 0) * amount.value);
const yieldCount = computed(() => (pickedRecipe.value ? takeOne(pickedRecipe.value.results, 0).count : 0));
// The words shown in place of Start when the day's forge points would be passed by the picked order
const refusalLabel = computed(() =>
  pickedRecipe.value ? computeForgeRefusalLabel(pickedRecipe.value, amount.value, progress.value, now, gameText) : "",
);
const queueSlots = computed(() => computeForgeQueueSlots(progress.value.orders, adventureRank, now));
// Each queue's words in the reader's language, from the order it holds in the forge state
const queueCells = computed<ForgeQueueCell[]>(() =>
  queueSlots.value.map(({ forged, id, recipeId: queueRecipeId, remainingSeconds, state, unlockRank }) => {
    const name = queueRecipeId === undefined ? "" : (recipeNameMap.value.get(queueRecipeId) ?? "");
    switch (state) {
      case ForgeQueueState.Complete: {
        return {
          id,
          name,
          progressLabel: fillGameTextValues(gameText[GameTextKey.ForgeQueueProgress], forged),
          state,
          timeLabel: "",
        };
      }
      case ForgeQueueState.Forging: {
        return {
          id,
          name,
          progressLabel: gameText[GameTextKey.ForgeQueueForging],
          state,
          timeLabel: fillGameTextValues(gameText[GameTextKey.ForgeTimeRemaining], formatForgeTime(remainingSeconds)),
        };
      }
      case ForgeQueueState.Idle: {
        return { id, name: "", progressLabel: gameText[GameTextKey.ForgeQueueIdle], state, timeLabel: "" };
      }
      default: {
        return {
          id,
          name: "",
          progressLabel: "",
          state,
          timeLabel: fillGameTextValues(gameText[GameTextKey.ForgeQueueLockLevel], unlockRank),
        };
      }
    }
  }),
);
// Starts the picked order in a free queue, its materials, Mora and talents taken, and leaves the forge as it was where the
// Forge refuses it
const start = () => {
  const recipe = pickedRecipe.value;
  if (!recipe) return;
  const started = startForge(recipe, amount.value, {
    adventureRank,
    definitions,
    inventory: inventory.value,
    isInRealm,
    now,
    partyCharacterIds,
    progress: progress.value,
    wallet: wallet.value,
  });
  if (!started) return;
  inventory.value = started.inventory;
  progress.value = started.progress;
  wallet.value = started.wallet;
};
// Obtains a finished queue: the units done are taken into the bag, the Adventure EXP gained, and the queue freed unless
// Units are still left in it
const obtain = (queueId: number) => {
  const index = queueId - 1;
  const order = progress.value.orders[index];
  const recipe = recipes.find(({ id }) => id === order?.recipeId);
  if (!order || !recipe) return;
  const obtained = obtainForgeOrder(recipe, order, {
    adventureExp: adventureExp.value,
    adventureRankTables,
    completedMainQuestIds,
    definitions,
    inventory: inventory.value,
    now,
    random,
    talents: computeForgeTalents(partyCharacterIds),
    wallet: wallet.value,
    weapons,
  });
  inventory.value = obtained.inventory;
  adventureExp.value = obtained.adventureExp;
  wallet.value = obtained.wallet;
  progress.value = {
    ...progress.value,
    orders: obtained.order
      ? progress.value.orders.with(index, obtained.order)
      : progress.value.orders.toSpliced(index, 1),
  };
};
</script>

<template>
  <!-- The forge, the blacksmith's screen: its title and two tabs across the head with the coins and the way out, the
       recipes on the left with the chosen one's amount and cost beside them, or the queues each holding an order that
       forges over real time and is obtained when it is done -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.ForgeTitle]">
    <ForgeScreen
      v-model:amount="amount"
      v-model:recipe-id="recipeId"
      v-model:tab="tab"
      :amount-label="fillGameTextValues(gameText[GameTextKey.ForgeAmount], amount)"
      :amount-maximum
      :close-label="gameText[GameTextKey.Back]"
      :coins="wallet[Currency.Mora]"
      :materials-box-label="gameText[GameTextKey.ForgeMaterials]"
      :materials-label="gameText[GameTextKey.ForgeMaterialsTab]"
      :obtain-label="gameText[GameTextKey.ForgeObtain]"
      :queues="queueCells"
      :queues-label="
        fillGameTextValues(
          gameText[GameTextKey.ForgeQueueButton],
          queueSlots.filter(({ state }) => state === ForgeQueueState.Forging).length,
          queueSlots.filter(({ state }) => state !== ForgeQueueState.Locked).length,
        )
      "
      :recipes="recipeCells"
      :refusal-label
      :required-coins
      :start-label="gameText[GameTextKey.ForgeStart]"
      :support-label="gameText[GameTextKey.ForgeSupportCharacter]"
      :yield-count
      :title="gameText[GameTextKey.ForgeTitle]"
      :total-time-label="fillGameTextValues(gameText[GameTextKey.ForgeTotalTime], formatForgeTime(totalSeconds))"
      @close="emit('close')"
      @obtain="(...args) => obtain(...args)"
      @start="(...args) => start(...args)"
    />
  </GameScreen>
</template>
