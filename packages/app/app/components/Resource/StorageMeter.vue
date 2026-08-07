<script setup lang="ts">
import { STORAGE_USAGE_ERROR_PERCENTAGE, STORAGE_USAGE_WARNING_PERCENTAGE } from "#shared/services/storage/constants";
import { getFileSize } from "@/services/file/getFileSize";
import { useStorageStore } from "@/store/storage";

const storageStore = useStorageStore();
const { storageUsage } = storeToRefs(storageStore);
const { smAndDown } = useVDisplay();
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

onMounted(() => storageStore.readStorageUsage());
</script>

<!-- Mounted by the resource shell on every page in the area, reading the number the store already holds -->
<template>
  <v-tooltip v-if="storageUsage" location="bottom">
    <template #activator="{ props }">
      <!-- Focusable so the tooltip is reachable without a pointer — it carries the tier and the exact numbers,
           which the bar alone does not say -->
      <div :="props" flex gap-2 items-center tabindex="0">
        <v-progress-linear :color="usedColor" height="6" :model-value="usedPercentage" rounded w-16 />
        <span v-if="!smAndDown" op-70 whitespace-nowrap text-body-medium>
          {{ getFileSize(storageUsage.bytesUsed) }} of {{ getFileSize(storageUsage.quotaBytes) }} used
        </span>
      </div>
    </template>
    {{ storageUsage.tier }} plan — {{ getFileSize(storageUsage.bytesUsed) }} of
    {{ getFileSize(storageUsage.quotaBytes) }} used by your resource files
  </v-tooltip>
</template>
