<script setup lang="ts">
import { STORAGE_USAGE_ERROR_PERCENTAGE, STORAGE_USAGE_WARNING_PERCENTAGE } from "#shared/services/storage/constants";
import { getFileSize } from "@/services/file/getFileSize";
import { useStorageStore } from "@/store/storage";

await useStorageSubscribables();

const storageStore = useStorageStore();
const { readStorageUsage } = storageStore;
const { storageUsage } = storeToRefs(storageStore);
// A tier with no quota would divide by zero; the gate treats it as no allowance at all, so a full bar is the
// Honest reading rather than an empty one
const usedPercentage = computed(() => {
  if (!storageUsage.value) return 0;
  else if (storageUsage.value.quotaBytes === 0) return 100;
  else return Math.min((storageUsage.value.bytesUsed / storageUsage.value.quotaBytes) * 100, 100);
});
// The label and the meter's reading say the same thing, so they say it from one place
const usageText = computed(() =>
  storageUsage.value
    ? `${getFileSize(storageUsage.value.bytesUsed)} of ${getFileSize(storageUsage.value.quotaBytes)} used`
    : "",
);

onMounted(async () => {
  await readStorageUsage();
});
</script>

<!-- Mounted by the resource shell on every page in the area, reading the number the store already holds. Everything
     it says is written out, at every width: the reading is the point of the meter, not metadata behind a hover -->
<template>
  <div v-if="storageUsage" flex flex-wrap gap-2 items-center>
    <UiMeter
      :high="STORAGE_USAGE_ERROR_PERCENTAGE"
      label="Storage"
      :low="STORAGE_USAGE_WARNING_PERCENTAGE"
      :value="usedPercentage"
      :value-text="usageText"
    />
    <span text-nowrap>{{ usageText }}</span>
    <span text-muted text-nowrap>{{ storageUsage.tier }} plan</span>
  </div>
</template>
