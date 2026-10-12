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
  // The Materials tab's label
  materialsLabel: string;
  // The Obtain button of a finished queue, and the Start button of the Materials tab, in the game's words
  obtainLabel: string;
  // The forge queues, each open one or locked until its Adventure Rank
  queues: ForgeQueueCell[];
  // The Forge Queues tab's label with its open queues, the game's "Forge Queues (1/3)"
  queuesLabel: string;
  // The Materials tab's recipe list, in the game's order
  recipes: ForgeRecipeCell[];
  // The coins the selected recipe costs for its amount
  requiredCoins: number;
  startLabel: string;
  // The title the game shows over the screen
  title: string;
  // The Materials tab's total forge time for the amount, in the game's words
  totalTimeLabel: string;
}

const amount = defineModel<number>("amount", { default: 1 });
const recipeId = defineModel<number>("recipeId", { default: 0 });
const tab = defineModel<ForgeTab>("tab", { default: ForgeTab.Materials });
const {
  amountLabel,
  amountMaximum,
  closeLabel,
  coins,
  materialsLabel,
  obtainLabel,
  queues,
  queuesLabel,
  recipes,
  requiredCoins,
  startLabel,
  title,
  totalTimeLabel,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; obtain: [queueId: number]; start: [] }>();
</script>

<template>
  <!-- The forge, the blacksmith's screen: its two tabs across the head with the coins and the way out, the recipes on the
       left with the chosen one's amount and cost beside them, or the queues each holding an order that forges over real
       time and is obtained when it is done. Provisional: every place, size and colour here waits on the forge screen's
       passes against the public clip of the Wagner forge (references/forge-screen) and the owed order-queue recording -->
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
    <template v-if="tab === ForgeTab.Materials">
      <ul class="recipes">
        <li v-for="recipe of recipes" :key="recipe.id">
          <button
            class="recipe"
            :aria-pressed="recipe.id === recipeId"
            :disabled="!recipe.isLearned"
            type="button"
            @click="recipeId = recipe.id"
          >
            <span class="recipe-name">{{ recipe.name }}</span>
            <span class="recipe-time">{{ recipe.forgeTimeLabel }}</span>
          </button>
        </li>
      </ul>
      <div class="detail">
        <input
          v-model.number="amount"
          :aria-label="amountLabel"
          class="amount"
          :max="amountMaximum"
          min="1"
          type="range"
        />
        <p class="total-time">{{ totalTimeLabel }}</p>
        <p class="required">{{ requiredCoins }}</p>
        <button class="start" type="button" @click="emit('start')">{{ startLabel }}</button>
      </div>
    </template>
    <ul v-else class="queues">
      <li v-for="queue of queues" :key="queue.id" class="queue" :data-state="queue.state">
        <span class="queue-name">{{ queue.name }}</span>
        <span class="queue-progress">{{ queue.progressLabel }}</span>
        <span class="queue-time">{{ queue.timeLabel }}</span>
        <button
          v-if="queue.state === ForgeQueueState.Complete"
          class="obtain"
          type="button"
          @click="emit('obtain', queue.id)"
        >
          {{ obtainLabel }}
        </button>
      </li>
    </ul>
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
.recipes {
  position: absolute;
  top: calc(var(--unit) * 252);
  left: calc(var(--unit) * 134);
  width: calc(var(--unit) * 750);
  margin: 0;
  padding: 0;
  list-style: none;
}
.recipes li + li {
  margin-top: calc(var(--unit) * 9.7);
}
.recipe {
  position: relative;
  display: block;
  width: 100%;
  height: calc(var(--unit) * 114.6);
  border: none;
  background: rgb(20 28 38 / 0.55);
  color: #ece5d8;
  text-align: left;
}
.recipes li:first-child .recipe {
  height: calc(var(--unit) * 123);
}
.recipe[aria-pressed="true"] {
  outline: calc(var(--unit) * 2) solid #ffffff;
  outline-offset: calc(var(--unit) * -2);
  background: rgb(236 229 216 / 0.25);
}
.recipe:disabled {
  opacity: 0.4;
}
.recipe-name {
  position: absolute;
  top: calc(var(--unit) * 28);
  left: calc(var(--unit) * 141);
  font-size: calc(var(--unit) * 29);
  line-height: 1;
}
.recipe-time {
  position: absolute;
  top: calc(var(--unit) * 78);
  left: calc(var(--unit) * 141);
  font-size: calc(var(--unit) * 24);
  line-height: 1;
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
.start {
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
.queues {
  position: absolute;
  top: calc(var(--unit) * 252);
  left: calc(var(--unit) * 134);
  width: calc(var(--unit) * 1600);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
