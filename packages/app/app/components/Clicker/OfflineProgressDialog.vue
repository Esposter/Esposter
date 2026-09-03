<script setup lang="ts">
import { OFFLINE_CAP_MS } from "@/services/clicker/constants";
import { formatNumberLong } from "@/services/clicker/formatNumberLong";
import { useClickerStore } from "@/store/clicker";
import { useOfflineProgressStore } from "@/store/clicker/offlineProgress";
import { formatDuration } from "@/util/date/formatDuration";

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
const displayElapsedDuration = computed(() => formatDuration(elapsedMs.value));
const displayAwardedPoints = computed(() => formatNumberLong(awardedPoints.value, 3));
const displayOfflineCap = formatDuration(OFFLINE_CAP_MS);
</script>

<template>
  <StyledDialog
    v-model="isOpen"
    hide-cancel-button
    :card-props="{ title: 'Welcome back!' }"
    :confirm-button-props="{ text: 'Collect' }"
    @confirm="(onComplete) => onComplete()"
  >
    <!-- The award stops accruing at the cap, so absences past it say so instead of implying the full time paid out -->
    While you were away for {{ displayElapsedDuration }}, your buildings produced
    <span font-bold>{{ displayAwardedPoints }}</span>
    {{ clickerItemProperties.pluralName
    }}<template v-if="elapsedMs > OFFLINE_CAP_MS"> (production is capped at {{ displayOfflineCap }})</template>.
  </StyledDialog>
</template>
