<script setup lang="ts">
import type { ForgeQueueCell } from "#src/models/ForgeQueueCell";
import type { ForgeRecipeCell } from "#src/models/ForgeRecipeCell";

import TwoColumnScreen from "#src/components/TwoColumnScreen/Index.vue";
import { ForgeQueueState } from "#src/models/ForgeQueueState";
import { ForgeTab } from "#src/models/ForgeTab";

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
  // The queue the Queues tab's detail shows, the first holding an order: its id, the words over its ring (its time left, or
  // Complete once every unit is done), its units done in words, its share of the unit being forged, and whether a unit is
  // Ready to obtain
  queueDetail?: { forgedLabel: string; headingLabel: string; id: number; isObtainable: boolean; progress: number };
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
    <header class="head">
      <p class="title" role="heading" aria-level="1">{{ title }}</p>
      <div class="tabs">
        <button class="tab" :aria-pressed="tab === ForgeTab.Materials" type="button" @click="tab = ForgeTab.Materials">
          {{ materialsLabel }}
        </button>
        <button class="tab" :aria-pressed="tab === ForgeTab.Queues" type="button" @click="tab = ForgeTab.Queues">
          {{ queuesLabel }}
        </button>
      </div>
      <p class="coins">{{ coins }}</p>
      <button class="close" :aria-label="closeLabel" type="button" @click="emit('close')">×</button>
    </header>
    <ul v-if="tab === ForgeTab.Materials" class="recipes">
      <li v-for="recipe of recipes" :key="recipe.id">
        <button
          class="recipe"
          :aria-pressed="recipe.id === recipeId"
          :disabled="!recipe.isOpen"
          type="button"
          @click="recipeId = recipe.id"
        >
          <span class="recipe-tile" aria-hidden="true" />
          <span class="recipe-name">{{ recipe.name }}</span>
          <span class="recipe-time">{{ recipe.forgeTimeLabel }}</span>
        </button>
      </li>
    </ul>
    <ul v-else class="queues">
      <li
        v-for="queue of queues"
        :key="queue.id"
        :class="{ selected: queue.id === queueDetail?.id }"
        class="queue"
        :data-state="queue.state"
      >
        <span aria-hidden="true" class="queue-tile" />
        <span class="queue-name">{{ queue.name }}</span>
        <span class="queue-progress">{{ queue.progressLabel }}</span>
        <span class="queue-ready">{{ queue.readyLabel }}</span>
        <span class="queue-time">{{ queue.timeLabel }}</span>
      </li>
    </ul>
    <template v-if="tab === ForgeTab.Materials">
      <span aria-hidden="true" class="sort" />
      <span aria-hidden="true" class="sort-toggle" />
    </template>
    <div class="detail">
      <template v-if="tab === ForgeTab.Materials">
        <input
          v-model.number="amount"
          :aria-label="amountLabel"
          class="amount"
          :max="amountMaximum"
          min="1"
          type="range"
        />
        <p class="total-time">{{ totalTimeLabel }}</p>
        <p class="amount-label">{{ amountLabel }}</p>
        <span aria-hidden="true" class="amount-step amount-minus">−</span>
        <span class="amount-end amount-min">1</span>
        <span class="amount-end amount-max">{{ amountMaximum }}</span>
        <span aria-hidden="true" class="amount-step amount-plus">+</span>
        <p class="required">{{ requiredCoins }}</p>
        <button v-if="!refusalLabel" class="action" type="button" @click="emit('start')">{{ startLabel }}</button>
        <p v-else class="refusal">{{ refusalLabel }}</p>
      </template>
      <template v-else-if="queueDetail">
        <p class="detail-heading">{{ queueDetail.headingLabel }}</p>
        <span v-if="queueDetail.progress < 1" aria-hidden="true" class="detail-ring" />
        <p class="detail-forged">{{ queueDetail.forgedLabel }}</p>
        <span class="detail-track">
          <span class="detail-fill" :style="{ width: `${queueDetail.progress * 100}%` }" />
        </span>
        <button v-if="queueDetail.isObtainable" class="action" type="button" @click="emit('obtain', queueDetail.id)">
          {{ obtainLabel }}
        </button>
      </template>
      <div class="item-icon">
        <span class="item-count">{{ yieldCount }}</span>
      </div>
      <section class="materials-box">
        <header class="materials-head">
          <p class="materials-title">{{ materialsBoxLabel }}</p>
          <p class="support-title">{{ supportLabel }}</p>
        </header>
        <span class="slot slot-first" />
        <span class="slot slot-second" />
        <span class="slot slot-third" />
        <p class="material-count">{{ materialCountLabel }}</p>
        <span class="support-portrait" />
      </section>
    </div>
  </TwoColumnScreen>
</template>

<style scoped>
/* Measured off the wiki-clip reference at 886 high, each as a unit of the game's 1080 high screen */
.forge-screen {
  color: #ece5d8;
  font-family: "Signika", sans-serif;
  font-weight: 600;
}
.title {
  position: absolute;
  top: calc(var(--unit) * 34);
  left: calc(var(--unit) * 268);
  margin: 0;
  font-size: calc(var(--unit) * 29);
  line-height: 1;
}
.coins {
  position: absolute;
  top: calc(var(--unit) * 41);
  left: calc(var(--unit) * 1902);
  margin: 0;
  font-size: calc(var(--unit) * 27);
  line-height: 1;
}
.close {
  position: absolute;
  top: calc(var(--unit) * 26);
  left: calc(var(--unit) * 2122);
  width: calc(var(--unit) * 66);
  height: calc(var(--unit) * 66);
  border: none;
  border-radius: 50%;
  background: #ece5d8;
  color: #3b3b3b;
  font-size: calc(var(--unit) * 36);
  line-height: 1;
}
.tabs {
  position: absolute;
  top: calc(var(--unit) * 155);
  left: calc(var(--unit) * 137);
  display: flex;
  gap: calc(var(--unit) * 2);
  width: calc(var(--unit) * 741);
  height: calc(var(--unit) * 61);
}
.tab {
  flex: 1;
  border: none;
  background: rgb(20 28 38 / 0.55);
  color: #ece5d8;
  font-size: calc(var(--unit) * 27);
}
.tab[aria-pressed="true"] {
  background: #ece5d8;
  color: #3b3b3b;
}
.recipes,
.queues {
  position: absolute;
  top: calc(var(--unit) * 252);
  left: calc(var(--unit) * 134);
  width: calc(var(--unit) * 750);
  margin: 0;
  padding: 0;
  list-style: none;
}
/* The recipe list scrolls: its sixth row shows only its top, above the sort control */
.recipes {
  height: calc(var(--unit) * 665);
  overflow: hidden;
}
.recipes li + li,
.queues li + li {
  margin-top: calc(var(--unit) * 9.7);
}
.recipe,
.queue {
  position: relative;
  height: calc(var(--unit) * 114.6);
  background: rgb(20 28 38 / 0.55);
  color: #ece5d8;
}
.recipe {
  display: block;
  width: 100%;
  border: none;
  background: rgb(20 28 38 / 0.68);
  text-align: left;
}
.recipes li:first-child .recipe,
.queues li:first-child.queue {
  height: calc(var(--unit) * 123);
}
.recipe[aria-pressed="true"],
.queue.selected {
  outline: calc(var(--unit) * 2) solid #ffffff;
  outline-offset: calc(var(--unit) * -2);
}
.recipe[aria-pressed="true"] {
  background: #ece3d5;
  color: #3b3b3b;
}
.recipe:disabled {
  opacity: 0.4;
}
.recipe-name {
  position: absolute;
  top: calc(var(--unit) * 14);
  left: calc(var(--unit) * 152);
  font-size: calc(var(--unit) * 35);
  line-height: 1;
}
.recipe-time {
  position: absolute;
  top: calc(var(--unit) * 64);
  left: calc(var(--unit) * 151);
  font-size: calc(var(--unit) * 29);
  line-height: 1;
}
.queue.selected {
  background: #ece5d8;
  color: #3b3b3b;
}
.recipe-tile,
.queue-tile {
  position: absolute;
  top: calc(var(--unit) * 9.8);
  left: calc(var(--unit) * 14.6);
  width: calc(var(--unit) * 107.3);
  height: calc(var(--unit) * 107.3);
  background: #3a4556;
}
.recipe-tile {
  background: #373045;
}
.queue[data-state="Idle"] .queue-tile {
  background: none;
}
.queue[data-state="Idle"] .queue-tile::before {
  content: "+";
  display: block;
  font-size: calc(var(--unit) * 60);
  line-height: calc(var(--unit) * 107.3);
  text-align: center;
}
.queue[data-state="Locked"] .queue-tile {
  background: rgb(0 0 0 / 0.35);
}
.queue-name,
.queue-progress,
.queue-time {
  position: absolute;
  top: calc(var(--unit) * 64);
  left: calc(var(--unit) * 152);
  font-size: calc(var(--unit) * 29);
  line-height: 1;
  white-space: nowrap;
}
.queue-name {
  top: calc(var(--unit) * 14);
  font-size: calc(var(--unit) * 35);
}
.queue[data-state="Forging"] .queue-progress {
  color: #f0a53a;
}
.queue[data-state="Complete"] .queue-progress {
  color: #8fd14f;
}
.queue-ready {
  position: absolute;
  top: calc(var(--unit) * 64);
  right: calc(var(--unit) * 20);
  color: #8fd14f;
  font-size: calc(var(--unit) * 29);
  line-height: 1;
  white-space: nowrap;
}
.queue[data-state="Idle"] .queue-progress,
.queue[data-state="Locked"] .queue-time {
  top: calc(var(--unit) * 40);
}
/* The Materials tab's sort control: a cream pill of the list's width with its toggle beside it, its word undrawn for want of a key */
.sort,
.sort-toggle {
  position: absolute;
  background: #e0dace;
}
.sort {
  top: calc(var(--unit) * 972);
  left: calc(var(--unit) * 157);
  width: calc(var(--unit) * 620);
  height: calc(var(--unit) * 52);
  border-radius: calc(var(--unit) * 26);
}
.sort-toggle {
  top: calc(var(--unit) * 976);
  left: calc(var(--unit) * 805);
  width: calc(var(--unit) * 42);
  height: calc(var(--unit) * 42);
  border-radius: 50%;
}
.detail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.detail > * {
  pointer-events: auto;
  position: absolute;
  margin: 0;
}
.total-time {
  top: calc(var(--unit) * 146);
  left: 50%;
  translate: -50% 0;
  font-size: calc(var(--unit) * 27);
  line-height: 1;
  white-space: nowrap;
}
.amount {
  top: calc(var(--unit) * 590);
  left: calc(var(--unit) * 1368);
  width: calc(var(--unit) * 446);
  height: calc(var(--unit) * 20);
  accent-color: #ece5d8;
}
.required {
  top: calc(var(--unit) * 987);
  left: calc(var(--unit) * 1011);
  font-size: calc(var(--unit) * 24);
  line-height: 1;
}
.refusal {
  top: calc(var(--unit) * 963);
  left: calc(var(--unit) * 1560);
  width: calc(var(--unit) * 600);
  font-size: calc(var(--unit) * 24);
  line-height: 1;
  text-align: right;
}
.action {
  top: calc(var(--unit) * 963);
  left: calc(var(--unit) * 1883);
  width: calc(var(--unit) * 277);
  height: calc(var(--unit) * 73);
  border: none;
  border-radius: calc(var(--unit) * 36);
  background: #ece5d8;
  color: #3b3b3b;
  font-size: calc(var(--unit) * 29);
}
.detail-ring {
  top: calc(var(--unit) * 205);
  left: calc(var(--unit) * 1320);
  width: calc(var(--unit) * 540);
  height: calc(var(--unit) * 350);
  border: calc(var(--unit) * 14) solid rgb(240 160 50 / 0.85);
  border-radius: 50%;
  box-shadow: 0 0 calc(var(--unit) * 30) rgb(255 150 40 / 0.5);
}
.detail-heading,
.detail-forged {
  left: calc(var(--unit) * 1590);
  translate: -50% 0;
  font-size: calc(var(--unit) * 27);
  line-height: 1;
  white-space: nowrap;
}
.detail-heading {
  top: calc(var(--unit) * 149);
}
.detail-forged {
  top: calc(var(--unit) * 566);
}
.detail-track {
  top: calc(var(--unit) * 620);
  left: calc(var(--unit) * 1225);
  width: calc(var(--unit) * 731);
  height: calc(var(--unit) * 12);
  background: rgb(255 255 255 / 0.2);
}
.detail-fill {
  display: block;
  height: 100%;
  background: #f0a53a;
}
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
.amount-label {
  top: calc(var(--unit) * 551);
  left: calc(var(--unit) * 1589.5);
  translate: -50% 0;
  color: #ece5d8;
  font-size: calc(var(--unit) * 26.8);
  line-height: 1;
  white-space: nowrap;
}
.materials-box {
  top: calc(var(--unit) * 658.2);
  left: calc(var(--unit) * 1025.1);
  width: calc(var(--unit) * 1130);
  height: calc(var(--unit) * 268.2);
  background: rgb(29 56 73 / 0.5);
}
.materials-head {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(var(--unit) * 48.8);
  background: #464c5f;
}
.materials-head p {
  position: absolute;
  top: calc(var(--unit) * 15.8);
  margin: 0;
  font-size: calc(var(--unit) * 26.8);
  line-height: 1;
  white-space: nowrap;
}
.materials-title {
  left: calc(var(--unit) * 42.7);
}
.support-title {
  right: calc(var(--unit) * 41.4);
}
.slot {
  position: absolute;
  top: calc(var(--unit) * 79.2);
  height: calc(var(--unit) * 170.7);
  border: calc(var(--unit) * 2.4) solid rgb(255 255 255 / 0.12);
}
.slot-first {
  left: calc(var(--unit) * 163.3);
  width: calc(var(--unit) * 141.4);
  background: #77797d;
}
.slot-second {
  left: calc(var(--unit) * 340.1);
  width: calc(var(--unit) * 134.1);
}
.slot-third {
  left: calc(var(--unit) * 508.3);
  width: calc(var(--unit) * 134.1);
}
.material-count {
  position: absolute;
  top: calc(var(--unit) * 219.4);
  left: calc(var(--unit) * 163.3);
  width: calc(var(--unit) * 141.4);
  margin: 0;
  font-size: calc(var(--unit) * 26.8);
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}
.support-portrait {
  position: absolute;
  top: calc(var(--unit) * 79.2);
  left: calc(var(--unit) * 825.2);
  width: calc(var(--unit) * 141.4);
  height: calc(var(--unit) * 170.7);
  background: #c2b094;
}

.amount-end {
  top: calc(var(--unit) * 614.4);
  translate: -50% -50%;
  font-size: calc(var(--unit) * 26.8);
  line-height: 1;
}
.amount-min {
  left: calc(var(--unit) * 1318.9);
}
.amount-max {
  left: calc(var(--unit) * 1861.4);
}
.amount-step {
  top: calc(var(--unit) * 614.4);
  width: calc(var(--unit) * 48.8);
  height: calc(var(--unit) * 48.8);
  border-radius: 50%;
  background: rgb(236 229 216 / 0.9);
  color: #3b3b3b;
  font-size: calc(var(--unit) * 31.7);
  line-height: calc(var(--unit) * 48.8);
  text-align: center;
  translate: -50% -50%;
}
.amount-minus {
  left: calc(var(--unit) * 1249.4);
}
.amount-plus {
  left: calc(var(--unit) * 1928.4);
}
</style>
