<script setup lang="ts">
import { STORAGE_USAGE_ERROR_PERCENTAGE, STORAGE_USAGE_WARNING_PERCENTAGE } from "#shared/services/storage/constants";
import { getFileSize } from "@/services/file/getFileSize";

const { $trpc } = useNuxtApp();
const { data: storageUsage } = useQuery(() => $trpc.storage.getUsage.query());
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
</script>

<template>
  <div>
    <div font-bold text-title-large>Storage</div>
    <div text-body-large>Files you have uploaded across rooms and resources</div>
    <StyledCard mt-6 p-2>
      <v-card-title>
        <div font-bold>Usage</div>
        <v-divider mt-2 />
      </v-card-title>
      <v-card-text>
        <template v-if="storageUsage">
          <v-progress-linear :color="usedColor" height="8" :model-value="usedPercentage" rounded />
          <div mt-4 text-body-large>
            {{ getFileSize(storageUsage.bytesUsed) }} of {{ getFileSize(storageUsage.quotaBytes) }} used
          </div>
          <div mt-1 op-70 text-body-medium>{{ storageUsage.tier }} plan</div>
        </template>
        <v-skeleton-loader v-else type="text" />
      </v-card-text>
    </StyledCard>
  </div>
</template>
