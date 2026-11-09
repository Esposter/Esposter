<script setup lang="ts">
import type { TextSegment } from "#src/models/TextSegment";

import { GAME_CREAM } from "#src/services/constants";

interface Props {
  // The picked level's reward, named as the game names it
  headline: string;
  // The picked level's requirement, its coloured runs as the game words them, "[]" where the screen names none
  requirement: TextSegment[];
}

defineProps<Props>();
</script>

<template>
  <section class="detail">
    <p class="headline">{{ headline }}</p>
    <p class="requirement">
      <span v-for="({ color, text }, index) of requirement" :key="index" :style="{ color }">{{ text }}</span>
    </p>
  </section>
</template>

<style scoped>
.detail {
  position: absolute;
  top: calc(var(--unit) * 165);
  left: calc(var(--unit) * 85);
  width: calc(var(--unit) * 520);
  color: v-bind(GAME_CREAM);
}

.headline {
  margin: 0;
  font-size: calc(var(--unit) * 46);
}

.requirement {
  margin: calc(var(--unit) * 16) 0 0;
  font-size: calc(var(--unit) * 26);
}
</style>
