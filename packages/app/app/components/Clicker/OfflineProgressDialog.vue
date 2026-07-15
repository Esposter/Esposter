<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";
import { useClickerStore } from "@/store/clicker";
import { useOfflineProgressStore } from "@/store/clicker/offlineProgress";
import { formatDuration } from "@/util/text/formatDuration";

const clickerStore = useClickerStore();
const { clickerItemProperties } = storeToRefs(clickerStore);
const offlineProgressStore = useOfflineProgressStore();
const { awardedPoints, elapsedMs } = storeToRefs(offlineProgressStore);
const isOpen = computed({
  get: () => awardedPoints.value > 0,
  set: (value) => {
    if (value) return;
    awardedPoints.value = 0;
    elapsedMs.value = 0;
  },
});
const displayAwardedPoints = computed(() => formatNumberLong(awardedPoints.value, 3));
const displayTimeAway = computed(() => formatDuration(elapsedMs.value));
</script>

<template>
  <v-dialog v-model="isOpen" max-width="400">
    <StyledCard :card-props="{ title: 'Welcome back!' }">
      <v-card-text>
        While you were away for {{ displayTimeAway }}, your buildings produced
        <span font-bold>{{ displayAwardedPoints }}</span>
        {{ clickerItemProperties.pluralName }}.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <StyledButton :button-props="{ text: 'Collect' }" @click="isOpen = false" />
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
