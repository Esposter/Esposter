<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
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
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Welcome back!" w="[min(32rem,90vw)]">
    <div p-3 flex flex-col gap-3>
      <p>
        <!-- The award stops accruing at the cap, so absences past it say so instead of implying the full time paid out -->
        While you were away for {{ displayElapsedDuration }}, your buildings produced
        <span :style="{ color: clickerItemProperties.color }">{{ displayAwardedPoints }}</span>
        {{ clickerItemProperties.pluralName
        }}<template v-if="elapsedMs > OFFLINE_CAP_MS"> (production is capped at {{ displayOfflineCap }})</template>.
      </p>
      <footer flex justify-end>
        <UiButton :variant="UiButtonVariant.Accent" @click="isOpen = false">Collect</UiButton>
      </footer>
    </div>
  </UiDialog>
</template>
