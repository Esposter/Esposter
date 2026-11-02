<script setup lang="ts">
import type { ForgeQueueDetail } from "#src/models/ForgeQueueDetail";

import ForgeScreenDetailMaterials from "#src/components/ForgeScreen/Detail/Materials/Index.vue";
import ForgeScreenDetailQueue from "#src/components/ForgeScreen/Detail/Queue/Index.vue";
import ForgeScreenMaterialsBox from "#src/components/ForgeScreen/MaterialsBox/Index.vue";
import { ForgeTab } from "#src/models/ForgeTab";

interface Props {
  // The amount slider's name for assistive tech, the game's "Amount" line
  amountLabel: string;
  // The amount the selected recipe forges, between one and the most its queue holds
  amountMaximum: number;
  // The count under the Materials box's first material, the bag's count of it over what one unit takes, the game's "28 / 2"
  materialCountLabel: string;
  // The Materials box's heading, and the support character's, in the game's words
  materialsBoxLabel: string;
  // The Obtain button of a queue with units ready, in the game's words
  obtainLabel: string;
  // The queue the Queues tab's detail shows
  queueDetail?: ForgeQueueDetail;
  // The refusal words the game shows in place of Start for an order past the day's forge points, or none
  refusalLabel: string;
  // The coins the selected recipe costs for its amount
  requiredCoins: number;
  // The Required line's label, the game's "Required", set over the coins
  requiredLabel: string;
  startLabel: string;
  supportLabel: string;
  // The tab open, which decides whether the Materials pane or the queue's pane is drawn
  tab: ForgeTab;
  // The Materials tab's total forge time for the amount, in the game's words
  totalTimeLabel: string;
  // The items the selected recipe forges each time, drawn under its large icon
  yieldCount: number;
}

const amount = defineModel<number>("amount");
const {
  amountLabel,
  amountMaximum,
  materialCountLabel,
  materialsBoxLabel,
  obtainLabel,
  queueDetail,
  refusalLabel,
  requiredCoins,
  requiredLabel,
  startLabel,
  supportLabel,
  tab,
  totalTimeLabel,
  yieldCount,
} = defineProps<Props>();
const emit = defineEmits<{ obtain: [queueId: number]; start: [] }>();
</script>

<template>
  <!-- The detail pane beside the list: the Materials tab's amount and cost or the Queues tab's ring and progress for the
       picked queue, with the item the recipe forges and the Materials box under them -->
  <div class="detail">
    <ForgeScreenDetailMaterials
      v-if="tab === ForgeTab.Materials"
      v-model:amount="amount"
      :amount-label
      :amount-maximum
      :refusal-label
      :required-coins
      :required-label
      :start-label
      :total-time-label
      @start="emit('start')"
    />
    <ForgeScreenDetailQueue
      v-else-if="queueDetail"
      :forged-label="queueDetail.forgedLabel"
      :heading-label="queueDetail.headingLabel"
      :is-obtainable="queueDetail.isObtainable"
      :obtain-label
      :progress="queueDetail.progress"
      :queue-id="queueDetail.id"
      @obtain="(queueId) => emit('obtain', queueId)"
    />
    <div class="item-icon">
      <span class="item-count">{{ yieldCount }}</span>
    </div>
    <ForgeScreenMaterialsBox :material-count-label :materials-box-label :support-label />
  </div>
</template>

<style scoped>
.item-icon {
  position: absolute;
  top: calc(var(--unit) * 265.7);
  left: calc(var(--unit) * 1505.4);
  width: calc(var(--unit) * 170.7);
  height: calc(var(--unit) * 209.7);
  background: #5b5a5f;
}
.item-count {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: calc(var(--unit) * 34.1);
  background: #e9e3dc;
  color: #3b3b3b;
  font-size: calc(var(--unit) * 26.8);
  line-height: calc(var(--unit) * 34.1);
  text-align: center;
}
</style>

<style scoped src="../../../styles/forgeDetail.css"></style>
