<script setup lang="ts">
import type { ArtifactSlotStats } from "#src/models/ArtifactSlotStats";

interface Props {
  // The picked slot's name, which the details name it by
  slotName?: string;
  // The picked slot's stats, undefined where the character wears no artifact there
  selectedStats?: ArtifactSlotStats;
}

const { selectedStats, slotName } = defineProps<Props>();
</script>

<template>
  <!-- The picked slot's name and stats, shown in place of the totals while Artifact Details is open -->
  <p class="slot-name">{{ slotName }}</p>
  <ul v-if="selectedStats" class="stats">
    <li class="stat">
      <span>{{ selectedStats.mainStat.label }}</span>
      <span>{{ selectedStats.mainStat.value }}</span>
    </li>
    <li v-for="({ label, value }, index) in selectedStats.subStats" :key="index" class="stat">
      <span>{{ label }}</span>
      <span>{{ value }}</span>
    </li>
  </ul>
</template>

<style scoped>
.stats {
  top: calc(var(--unit) * 250);
}

.slot-name {
  position: absolute;
  top: calc(var(--unit) * 212);
  right: 0;
  left: 0;
  margin: 0;
  padding: 0 calc(var(--unit) * 28);
  color: #fff;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 30);
}
</style>

<style scoped src="../../../../styles/artifactStats.css"></style>
