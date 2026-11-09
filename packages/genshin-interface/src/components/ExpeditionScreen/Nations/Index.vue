<script setup lang="ts">
import type { ExpeditionNation } from "#src/models/ExpeditionNation";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The nations down the left in the game's order, the picked one drawn larger
  nations: ExpeditionNation[];
}

const nation = defineModel<string>("nation", { required: true });
defineProps<Props>();
</script>

<template>
  <ul class="nations">
    <li v-for="{ hasAlert, name } of nations" :key="name">
      <GameButton
        class="nation"
        :aria-pressed="name === nation"
        :kind="GameButtonKind.Row"
        tip=""
        @click="nation = name"
      >
        <span class="marker" aria-hidden="true" />
        <span>{{ name }}</span>
        <span v-if="hasAlert" class="alert" aria-hidden="true">!</span>
      </GameButton>
    </li>
  </ul>
</template>

<style scoped>
.nations {
  position: absolute;
  top: calc(var(--unit) * 136);
  left: calc(var(--unit) * 70);
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 20);
  margin: 0;
  padding: 0;
  list-style: none;
}

.nation {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 34);
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 30);
  letter-spacing: calc(var(--unit) * 2);
  text-shadow: 0 calc(var(--unit) * 2) calc(var(--unit) * 4) rgb(0 0 0 / 0.5);
}

.nation[aria-pressed="true"] {
  font-size: calc(var(--unit) * 42);
}

.marker {
  width: calc(var(--unit) * 12);
  height: calc(var(--unit) * 12);
  flex: none;
  background: currentcolor;
  transform: rotate(45deg);
}

/* The picked nation's diamond is hollow, 18 across with a stroke of 3, drawn over its label's left edge */
.nation[aria-pressed="true"] .marker {
  width: calc(var(--unit) * 18);
  height: calc(var(--unit) * 18);
  margin-left: calc(var(--unit) * -4);
  border: calc(var(--unit) * 3) solid currentcolor;
  background: none;
  box-sizing: border-box;
}

.alert {
  display: inline-flex;
  width: calc(var(--unit) * 20);
  height: calc(var(--unit) * 20);
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #d8473a;
  color: #fff;
  font-size: calc(var(--unit) * 16);
}
</style>
