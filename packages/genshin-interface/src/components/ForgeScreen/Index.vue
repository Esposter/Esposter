<script setup lang="ts">
import type { ForgeQueueCell } from "#src/models/ForgeQueueCell";
import type { ForgeQueueDetail } from "#src/models/ForgeQueueDetail";
import type { ForgeRecipeCell } from "#src/models/ForgeRecipeCell";

import ForgeScreenDetail from "#src/components/ForgeScreen/Detail/Index.vue";
import ForgeScreenHead from "#src/components/ForgeScreen/Head/Index.vue";
import ForgeScreenRecipes from "#src/components/ForgeScreen/Recipes/Index.vue";
import TwoColumnScreen from "#src/components/TwoColumnScreen/Index.vue";
import { ForgeTab } from "#src/models/ForgeTab";
import { GAME_CREAM } from "#src/services/constants";

interface Props {
  // The amount slider's name for assistive tech, the game's "Amount" line
  amountLabel: string;
  // The amount the selected recipe forges, between one and the most its queue holds
  amountMaximum: number;
  // The close button's name for assistive tech, the game's "Back" line
  closeLabel: string;
  // The coins the wallet holds
  coins: number;
  // The count under the Materials box's first material, the bag's count of it over what one unit takes, the game's "28 / 2"
  materialCountLabel: string;
  // The Materials box's heading, and the support character's, in the game's words
  materialsBoxLabel: string;
  // The Materials tab's label
  materialsLabel: string;
  // The Obtain button of a queue with units ready, in the game's words
  obtainLabel: string;
  // The queue the Queues tab's detail shows
  queueDetail?: ForgeQueueDetail;
  // The forge queues, each open one or locked until its Adventure Rank
  queues: ForgeQueueCell[];
  // The Forge Queues tab's label with its open queues, the game's "Forge Queues (1/3)"
  queuesLabel: string;
  // The Materials tab's recipe list, in the game's order
  recipes: ForgeRecipeCell[];
  // The refusal words the game shows in place of Start for an order past the day's forge points, or none
  refusalLabel: string;
  // The coins the selected recipe costs for its amount
  requiredCoins: number;
  // The Required line's label, the game's "Required", set over the coins
  requiredLabel: string;
  startLabel: string;
  supportLabel: string;
  // The title the game shows over the screen
  title: string;
  // The Materials tab's total forge time for the amount, in the game's words
  totalTimeLabel: string;
  // The items the selected recipe forges each time, drawn under its large icon
  yieldCount: number;
}

const amount = defineModel<number>("amount", { default: 1 });
const recipeId = defineModel<number>("recipeId", { default: 0 });
const tab = defineModel<ForgeTab>("tab", { default: ForgeTab.Materials });
const {
  amountLabel,
  amountMaximum,
  closeLabel,
  coins,
  materialCountLabel,
  materialsBoxLabel,
  materialsLabel,
  obtainLabel,
  queueDetail,
  queues,
  queuesLabel,
  recipes,
  refusalLabel,
  requiredCoins,
  requiredLabel,
  startLabel,
  supportLabel,
  title,
  totalTimeLabel,
  yieldCount,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; obtain: [queueId: number]; start: [] }>();
</script>

<template>
  <!-- The forge, the blacksmith's screen: its two tabs across the head with the coins and the way out, the recipes on the
       left with the chosen one's amount and cost beside them, or the queues each holding an order that forges over real
       time, with the picked queue's time left, units done and Obtain beside them. The forging ring is drawn at the moment
       the reference shows, not animated -->
  <TwoColumnScreen class="forge-screen">
    <ForgeScreenHead
      v-model:tab="tab"
      :close-label
      :coins
      :materials-label
      :queues-label
      :title
      @close="emit('close')"
    />
    <ForgeScreenRecipes v-model:recipe-id="recipeId" :queues :recipes :selected-queue-id="queueDetail?.id" :tab />
    <ForgeScreenDetail
      v-model:amount="amount"
      :amount-label
      :amount-maximum
      :material-count-label
      :materials-box-label
      :obtain-label
      :queue-detail
      :refusal-label
      :required-coins
      :required-label
      :start-label
      :support-label
      :tab
      :total-time-label
      :yield-count
      @obtain="(queueId) => emit('obtain', queueId)"
      @start="emit('start')"
    />
  </TwoColumnScreen>
</template>

<style scoped>
/* Measured off the wiki-clip reference at 886 high, each as a unit of the game's 1080 high screen */
.forge-screen {
  color: v-bind(GAME_CREAM);
  font-family: "Signika", sans-serif;
  font-weight: 600;
}
</style>
