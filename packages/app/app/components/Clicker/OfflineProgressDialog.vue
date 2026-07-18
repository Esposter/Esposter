<script setup lang="ts">
import { OFFLINE_CAP } from "@/services/clicker/constants";
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
// The award stops accruing at the cap, so absences past it say so instead of implying the full time paid out
const isCapped = computed(() => elapsedMs.value > OFFLINE_CAP);
const displayOfflineCap = computed(() => formatDuration(OFFLINE_CAP));
</script>

<template>
  <StyledDialog
    v-model="isOpen"
    hide-cancel-button
    :card-props="{ title: 'Welcome back!' }"
    :confirm-button-props="{ text: 'Collect' }"
    @confirm="(onComplete) => onComplete()"
  >
    While you were away for {{ displayTimeAway }}, your buildings produced
    <span font-bold>{{ displayAwardedPoints }}</span>
    {{ clickerItemProperties.pluralName
    }}<template v-if="isCapped"> (production is capped at {{ displayOfflineCap }})</template>.
  </StyledDialog>
</template>
