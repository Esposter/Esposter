<script setup lang="ts">
import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeQueueSlot } from "#src/models/forging/ForgeQueueSlot";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { ForgeQueueCell, ForgeRecipeCell, ForgeTab } from "genshin-interface";
import type { GameText } from "genshin-text";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { Currency } from "#src/models/inventory/Currency";
import { checkIsForgeRecipeOpen } from "#src/services/forging/checkIsForgeRecipeOpen";
import { computeForgeQueueSlots } from "#src/services/forging/computeForgeQueueSlots";
import { computeForgeRefusalLabel } from "#src/services/forging/computeForgeRefusalLabel";
import { computeForgeTalents } from "#src/services/forging/computeForgeTalents";
import { obtainForgeOrder } from "#src/services/forging/obtainForgeOrder";
import { startForge } from "#src/services/forging/startForge";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { SECONDS_PER_MINUTE } from "#src/services/time/constants";
import { takeOne } from "@esposter/shared";
import { ForgeQueueState, ForgeScreen, GameScreen, ItemCategory } from "genshin-interface";
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
const emit = defineEmits<{ achievementEvents: [achievementEvents: AchievementEvent[]]; close: [] }>();
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
    name: recipeNameMap.value.get(recipe.id) ?? "",
  })),
);
const findRecipe = (id: number) => recipes.find((recipe) => recipe.id === id);
const pickedRecipe = computed(() => findRecipe(recipeId.value));
// The most a recipe's queue holds, the one ceiling the amount is kept under
const getAmountMaximum = (recipe: ForgeRecipe | undefined) => recipe?.queueSize ?? 1;
const amountMaximum = computed(() => getAmountMaximum(pickedRecipe.value));
const requiredCoins = computed(() => (pickedRecipe.value?.mora ?? 0) * amount.value);
const totalSeconds = computed(() => (pickedRecipe.value?.seconds ?? 0) * amount.value);
const yieldCount = computed(() => (pickedRecipe.value ? takeOne(pickedRecipe.value.results, 0).count : 0));
// The Materials box's count under the first material the picked recipe takes: the bag's count of it over what one unit takes
const materialCountLabel = computed(() => {
  if (!pickedRecipe.value) return "";
  const { count, id } = takeOne(pickedRecipe.value.materials, 0);
  return `${countInventoryItem(inventory.value.items, id)} / ${count}`;
});
// The words shown in place of Start when the day's forge points would be passed by the picked order
const refusalLabel = computed(() =>
  pickedRecipe.value ? computeForgeRefusalLabel(pickedRecipe.value, amount.value, progress.value, now, gameText) : "",
);
const queueSlots = computed(() => computeForgeQueueSlots(progress.value.orders, adventureRank, now));
// A queue holds an order while it forges, or once the order is done and waits to be obtained
const isQueueOccupied = ({ state }: ForgeQueueSlot) =>
  state === ForgeQueueState.Forging || state === ForgeQueueState.Complete;
// Each queue's words in the reader's language, from the order it holds in the forge state
const queueCells = computed<ForgeQueueCell[]>(() =>
  queueSlots.value.map(({ forged, id, recipeId: queueRecipeId, state, unlockRank }) => {
    const name = queueRecipeId === undefined ? "" : (recipeNameMap.value.get(queueRecipeId) ?? "");
    // Each state gives its own words over this blank cell, so a state that gives none shows none
    const cell: ForgeQueueCell = { id, name: "", progressLabel: "", readyLabel: "", state, timeLabel: "" };
    switch (state) {
      case ForgeQueueState.Complete:
      case ForgeQueueState.Forging: {
        const progressKey =
          state === ForgeQueueState.Complete ? GameTextKey.ForgeQueueCompleted : GameTextKey.ForgeQueueForging;
        return {
          ...cell,
          name,
          progressLabel: gameText[progressKey],
          readyLabel: fillGameTextValues(gameText[GameTextKey.ForgeQueueReadyCount], forged),
        };
      }
      case ForgeQueueState.Idle: {
        return { ...cell, progressLabel: gameText[GameTextKey.ForgeQueueIdle] };
      }
      default: {
        return { ...cell, timeLabel: fillGameTextValues(gameText[GameTextKey.ForgeQueueLockLevel], unlockRank) };
      }
    }
  }),
);
// The queue the Queues tab's detail shows, the first holding an order: its units done, the words over its ring (its time
// Left, or Complete once every unit is done) and the share of the unit being forged, which a complete queue shows full
const queueDetail = computed(() => {
  const slot = queueSlots.value.find((queueSlot) => isQueueOccupied(queueSlot));
  const order = progress.value.orders.find(({ queueId }) => queueId === slot?.id);
  if (!slot || !order) return;
  const isComplete = slot.state === ForgeQueueState.Complete;
  const elapsedSeconds = now.since(order.startedAt).total({ unit: "second" });
  return {
    forgedLabel: fillGameTextValues(gameText[GameTextKey.ForgeQueueProgress], `${slot.forged}/${order.count}`),
    headingLabel: isComplete
      ? gameText[GameTextKey.ForgeComplete]
      : fillGameTextValues(gameText[GameTextKey.ForgeTimeRemaining], formatForgeTime(slot.remainingSeconds)),
    id: slot.id,
    isObtainable: slot.forged > 0,
    progress: isComplete ? 1 : (elapsedSeconds - slot.forged * order.unitSeconds) / order.unitSeconds,
  };
});
// Picks a recipe and brings the amount under the most the picked recipe's queue holds, read from the pick itself: the parent's
// Recipe is still the old one until it re-renders
const pickRecipe = (id: number) => {
  recipeId.value = id;
  amount.value = Math.min(amount.value, getAmountMaximum(findRecipe(id)));
};
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
  const order = progress.value.orders.find((queueOrder) => queueOrder.queueId === queueId);
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
  // The weapons the order took in are the bag's entries past its next id that are weapons, each one a forged weapon
  // Counted at its rarity
  const forgedWeapons = obtained.inventory.items.filter(
    ({ definition, id }) => id >= inventory.value.nextId && definition.category === ItemCategory.Weapon,
  );
  if (forgedWeapons.length > 0)
    emit(
      "achievementEvents",
      forgedWeapons.map(({ definition }) => ({
        kind: AchievementEventKind.WeaponForged,
        quantity: 1,
        targetId: String(definition.rarity),
      })),
    );
  inventory.value = obtained.inventory;
  adventureExp.value = obtained.adventureExp;
  wallet.value = obtained.wallet;
  const otherOrders = progress.value.orders.filter((queueOrder) => queueOrder.queueId !== queueId);
  progress.value = { ...progress.value, orders: obtained.order ? [...otherOrders, obtained.order] : otherOrders };
};
</script>

<template>
  <!-- The forge, the blacksmith's screen: its title and two tabs across the head with the coins and the way out, the
       recipes on the left with the chosen one's amount and cost beside them, or the queues each holding an order that
       forges over real time and is obtained when it is done -->
  <GameScreen class="forge-screen" role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.ForgeTitle]">
    <ForgeScreen
      v-model:amount="amount"
      v-model:tab="tab"
      :recipe-id
      :amount-label="fillGameTextValues(gameText[GameTextKey.ForgeAmount], amount)"
      :amount-maximum
      :close-label="gameText[GameTextKey.Back]"
      :coins="wallet[Currency.Mora]"
      :material-count-label
      :materials-box-label="gameText[GameTextKey.ForgeMaterials]"
      :materials-label="gameText[GameTextKey.ForgeMaterialsTab]"
      :obtain-label="gameText[GameTextKey.ForgeObtain]"
      :queue-detail
      :queues="queueCells"
      :queues-label="
        fillGameTextValues(
          gameText[GameTextKey.ForgeQueueButton],
          queueSlots.filter((queueSlot) => isQueueOccupied(queueSlot)).length,
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
      @obtain="(queueId) => obtain(queueId)"
      @start="start()"
      @update:recipe-id="(recipeId) => pickRecipe(recipeId)"
    />
  </GameScreen>
</template>

<style scoped>
/* The still is 1920 by 886, so its frame spans 2340.4 units at the height's unit, rounded up to the width the unit fits */
.forge-screen {
  --game-design-width: 2341;
}
</style>
