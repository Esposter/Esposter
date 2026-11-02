<script setup lang="ts">
import type { ForgeQueueCell } from "#src/models/ForgeQueueCell";
import type { ForgeRecipeCell } from "#src/models/ForgeRecipeCell";

import GameButton from "#src/components/GameButton/Index.vue";
import { ForgeTab } from "#src/models/ForgeTab";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { GAME_CREAM } from "#src/services/constants";

interface Props {
  // The forge queues, each open one or locked until its Adventure Rank
  queues: ForgeQueueCell[];
  // The recipe the amount and cost are set for, the one its row shows pressed
  recipeId: number;
  // The Materials tab's recipe list, in the game's order
  recipes: ForgeRecipeCell[];
  // The queue the Queues tab's detail shows, the one its row is outlined as, or none
  selectedQueueId?: number;
  // The tab open, the Materials tab's recipes or the Queues tab's queues
  tab: ForgeTab;
}

const { queues, recipeId, recipes, selectedQueueId, tab } = defineProps<Props>();
const emit = defineEmits<{ "update:recipeId": [recipeId: number] }>();
</script>

<template>
  <!-- The list on the left of the screen: the recipes the Materials tab picks from, or the forge queues the Queues tab
       shows, with the Materials tab's sort control beside the recipes -->
  <ul v-if="tab === ForgeTab.Materials" class="recipes">
    <li v-for="recipe of recipes" :key="recipe.id">
      <GameButton
        class="recipe"
        :aria-pressed="recipe.id === recipeId"
        :disabled="!recipe.isOpen"
        :kind="GameButtonKind.Row"
        tip=""
        @click="emit('update:recipeId', recipe.id)"
      >
        <span class="recipe-tile" aria-hidden="true" />
        <span class="recipe-name">{{ recipe.name }}</span>
        <span class="recipe-time">{{ recipe.forgeTimeLabel }}</span>
      </GameButton>
    </li>
  </ul>
  <ul v-else class="queues">
    <li
      v-for="queue of queues"
      :key="queue.id"
      :class="{ selected: queue.id === selectedQueueId }"
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
</template>

<style scoped>
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
/* The recipe list scrolls within its height, by wheel or touch, with no scrollbar drawn: its sixth row shows only
   its top */
.recipes {
  height: calc(var(--unit) * 665);
  overflow-y: auto;
  scrollbar-width: none;
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
  color: v-bind(GAME_CREAM);
}
.recipe {
  display: block;
  width: 100%;
  border: none;
  background: rgb(29 38 50 / 0.68);
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
/* The rows the pick is not on sit 17 units in from the pressed row's edges, which take the full list width */
.recipe:not([aria-pressed="true"]),
.queue:not(.selected) {
  width: calc(100% - var(--unit) * 33);
  margin-left: calc(var(--unit) * 17);
}
.recipe:disabled {
  opacity: 0.4;
}
.recipe-name,
.recipe-time,
.queue-name,
.queue-progress,
.queue-time {
  position: absolute;
  top: calc(var(--unit) * 64);
  left: calc(var(--unit) * 141);
  font-size: calc(var(--unit) * 29);
  line-height: 1;
  letter-spacing: calc(var(--unit) * 2.5);
}
.recipe-name,
.queue-name {
  top: calc(var(--unit) * 18);
  font-size: calc(var(--unit) * 39);
  letter-spacing: calc(var(--unit) * 1.8);
}
.recipe:not([aria-pressed="true"]) .recipe-name,
.recipe:not([aria-pressed="true"]) .recipe-time {
  left: calc(var(--unit) * 133);
}
/* The first row is taller than the rest, and its time line sits lower in it */
.recipes li:first-child .recipe-time {
  top: calc(var(--unit) * 74);
}
.queue.selected {
  background: v-bind(GAME_CREAM);
  color: #3b3b3b;
}
.recipe-tile,
.queue-tile {
  position: absolute;
  top: calc(var(--unit) * 9.8);
  left: calc(var(--unit) * 5);
  width: calc(var(--unit) * 107.3);
  height: calc(var(--unit) * 107.3);
  background: #3a4556;
}
.recipe-tile {
  background: #373045;
}
/* An idle or locked queue's tile sits flush with its inset row's edge */
.queue:not(.selected) .queue-tile {
  left: 0;
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
  white-space: nowrap;
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
.queue[data-state="Idle"] .queue-progress {
  top: calc(var(--unit) * 42);
}
.queue:not(.selected) .queue-name,
.queue:not(.selected) .queue-progress,
.queue:not(.selected) .queue-time {
  left: calc(var(--unit) * 133);
}
.queue[data-state="Locked"] .queue-time {
  top: calc(var(--unit) * 46);
}
/* The Materials tab's sort control: a cream pill of the list's width with its toggle beside it, its word undrawn for want of a key */
.sort,
.sort-toggle {
  position: absolute;
  background: v-bind(GAME_CREAM);
}
.sort {
  top: calc(var(--unit) * 972);
  left: calc(var(--unit) * 157);
  width: calc(var(--unit) * 620);
  height: calc(var(--unit) * 52);
  border-radius: calc(var(--unit) * 26);
}
.sort-toggle {
  top: calc(var(--unit) * 972);
  left: calc(var(--unit) * 801);
  width: calc(var(--unit) * 61);
  height: calc(var(--unit) * 61);
  border-radius: 50%;
}
</style>
