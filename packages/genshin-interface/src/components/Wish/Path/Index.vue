<script setup lang="ts">
import type { TextSegment } from "#src/models/TextSegment";

interface Props {
  // The Fate Points the Epitomized Path holds as the game words and colours them
  fatePoints: TextSegment[];
  // The Epitomized Path's name
  pathLabel: string;
}

const { fatePoints, pathLabel } = defineProps<Props>();
</script>

<template>
  <!-- The Epitomized Path the weapon wish's banner holds, its name and its Fate Points as the game words and colours them -->
  <p>
    {{ pathLabel }}
    <span class="fate-points">
      <span v-for="({ color, text }, index) of fatePoints" :key="index" :style="{ color }">{{ text }}</span>
    </span>
  </p>
</template>

<style scoped>
p {
  margin: 0;
  font-size: calc(var(--unit) * 22);
}

.fate-points {
  margin-left: calc(var(--unit) * 12);
  opacity: 0.7;
}
</style>
