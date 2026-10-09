<script setup lang="ts">
import type { ForgeQueueCell } from "#src/models/ForgeQueueCell";
import type { ForgeRecipeCell } from "#src/models/ForgeRecipeCell";

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
  <div class="forge-screen">
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
  </div>
</template>

<style scoped>
.forge-screen {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  color: #ece5d8;
}

.head,
.queues {
  grid-column: 1 / -1;
}
</style>
