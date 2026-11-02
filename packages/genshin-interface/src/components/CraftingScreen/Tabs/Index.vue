<script setup lang="ts">
import type { CraftingCell } from "#src/models/CraftingCell";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The recipe tabs, one per combine type the bench holds, in the game's order
  tabs: CraftingCell[];
}

const tabId = defineModel<number>("tabId", { default: 0 });
const { tabs } = defineProps<Props>();
</script>

<template>
  <ul class="tabs">
    <li v-for="tab of tabs" :key="tab.id">
      <GameButton
        class="tab"
        :aria-pressed="tab.id === tabId"
        :kind="GameButtonKind.Row"
        tip=""
        @click="tabId = tab.id"
      >
        <span class="tab-name">{{ tab.name }}</span>
      </GameButton>
    </li>
  </ul>
</template>

<style scoped>
.tabs {
  position: absolute;
  top: calc(var(--unit) * 24);
  left: calc(var(--unit) * 822);
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tab {
  width: calc(var(--unit) * 96);
  height: calc(var(--unit) * 68);
}

.tab[aria-pressed="true"] {
  border-bottom: calc(var(--unit) * 4) solid #e8d9b0;
}
</style>

<style scoped src="../../../styles/visuallyHidden.css"></style>
