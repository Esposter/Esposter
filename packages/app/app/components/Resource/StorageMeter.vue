<script setup lang="ts">
import { STORAGE_USAGE_ERROR_PERCENTAGE, STORAGE_USAGE_WARNING_PERCENTAGE } from "#shared/services/storage/constants";
import { getFileSize } from "@/services/file/getFileSize";
import { useStorageStore } from "@/store/storage";

const storageStore = useStorageStore();
const { storageUsage } = storeToRefs(storageStore);
// A tier with no quota would divide by zero; the gate treats it as no allowance at all, so a full bar is the
// Honest reading rather than an empty one
const usedPercentage = computed(() => {
  if (!storageUsage.value) return 0;
  else if (storageUsage.value.quotaBytes === 0) return 100;
  return Math.min((storageUsage.value.bytesUsed / storageUsage.value.quotaBytes) * 100, 100);
});
const usedColor = computed(() => {
  if (usedPercentage.value >= STORAGE_USAGE_ERROR_PERCENTAGE) return "error";
  else if (usedPercentage.value >= STORAGE_USAGE_WARNING_PERCENTAGE) return "warning";
  return "primary";
});
// The label and the tooltip say the same thing, so they say it from one place
const usageText = computed(() =>
  storageUsage.value
    ? `${getFileSize(storageUsage.value.bytesUsed)} of ${getFileSize(storageUsage.value.quotaBytes)} used`
    : "",
);

onMounted(() => storageStore.readStorageUsage());
</script>

<!-- Mounted by the resource shell on every page in the area, reading the number the store already holds -->
<template>
  <!-- The tier appears nowhere else, so a touch device with no hover reaches it by focus: `openOnFocus` is unset
       here and VOverlay reads that as `openOnHover`, so a tap on the focusable activator opens it. Not
       `openOnClick`, which is a toggle — the click that follows a tap's synthesized mouseenter closes it again -->
  <v-tooltip v-if="storageUsage" location="bottom">
    <template #activator="{ props }">
      <!-- Focusable so the tooltip is reachable without a pointer -->
      <div :="props" flex gap-2 items-center tabindex="0">
        <v-progress-linear :color="usedColor" height="6" :model-value="usedPercentage" rounded w-16 />
        <span op-70 whitespace-nowrap text-body-medium>{{ usageText }}</span>
      </div>
    </template>
    {{ storageUsage.tier }} plan — {{ usageText }} by your resource files
  </v-tooltip>
</template>
