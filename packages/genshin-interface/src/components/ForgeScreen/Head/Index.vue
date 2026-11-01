<script setup lang="ts">
import CloseButton from "#src/components/CloseButton/Index.vue";
import GameButton from "#src/components/GameButton/Index.vue";
import { CloseButtonMark } from "#src/models/CloseButtonMark";
import { ForgeTab } from "#src/models/ForgeTab";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { GAME_CREAM } from "#src/services/constants";

interface Props {
  // The close button's name for assistive tech, the game's "Back" line
  closeLabel: string;
  // The coins the wallet holds
  coins: number;
  // The Materials tab's label
  materialsLabel: string;
  // The Forge Queues tab's label with its open queues, the game's "Forge Queues (1/3)"
  queuesLabel: string;
  // The tab open, the one of the two tabs that shows pressed
  tab: ForgeTab;
  // The title the game shows over the screen
  title: string;
}

const { closeLabel, coins, materialsLabel, queuesLabel, tab, title } = defineProps<Props>();
const emit = defineEmits<{ close: []; "update:tab": [tab: ForgeTab] }>();
</script>

<template>
  <!-- The head row of the forge: the title over its two tabs, with the coins and the way out beside them -->
  <header class="head">
    <p class="title" role="heading" aria-level="1">{{ title }}</p>
    <div class="tabs">
      <GameButton
        class="tab"
        :aria-pressed="tab === ForgeTab.Materials"
        :kind="GameButtonKind.Row"
        tip=""
        @click="emit('update:tab', ForgeTab.Materials)"
      >
        {{ materialsLabel }}
      </GameButton>
      <GameButton
        class="tab"
        :aria-pressed="tab === ForgeTab.Queues"
        :kind="GameButtonKind.Row"
        tip=""
        @click="emit('update:tab', ForgeTab.Queues)"
      >
        {{ queuesLabel }}
      </GameButton>
    </div>
    <p class="coins">{{ coins }}</p>
    <CloseButton class="close" :label="closeLabel" :mark="CloseButtonMark.Cross" @click="emit('close')" />
  </header>
</template>

<style scoped>
/* The game's face is wider than Signika at the same cap height, so each line is letter-spaced out to its width */
.title {
  position: absolute;
  top: calc(var(--unit) * 46);
  left: calc(var(--unit) * 270);
  margin: 0;
  font-size: calc(var(--unit) * 29);
  line-height: 1;
  letter-spacing: calc(var(--unit) * 2.75);
}
.coins {
  position: absolute;
  top: calc(var(--unit) * 43);
  left: calc(var(--unit) * 1896);
  margin: 0;
  font-size: calc(var(--unit) * 32);
  line-height: 1;
  letter-spacing: calc(var(--unit) * 2.2);
}
.close {
  top: calc(var(--unit) * 26);
  left: calc(var(--unit) * 2122);
  width: calc(var(--unit) * 66);
  height: calc(var(--unit) * 66);
  background: v-bind(GAME_CREAM);
  color: #3b3b3b;
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
  color: v-bind(GAME_CREAM);
  font-size: calc(var(--unit) * 27);
}
.tab[aria-pressed="true"] {
  background: v-bind(GAME_CREAM);
  color: #3b3b3b;
}
</style>
