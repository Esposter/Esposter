<script setup lang="ts">
import type { DatasetTruncation } from "@/models/dataset/DatasetTruncation";

import { DATASET_ROW_CAP_DESCRIPTION } from "#shared/services/dataset/constants";
import { getDatasetTruncationText } from "@/services/dataset/getDatasetTruncationText";

interface Props {
  truncation: DatasetTruncation;
}

const { truncation } = defineProps<Props>();
</script>

<template>
  <!-- The whole footnote is the tooltip activator so the explanation is reachable from the text, not just the icon -->
  <v-tooltip :text="DATASET_ROW_CAP_DESCRIPTION">
    <template #activator="{ props }">
      <div flex gap-1 items-center :="props">
        <v-icon color="warning" icon="mdi-alert-outline" size="small" />
        <span text-hint>{{ getDatasetTruncationText(truncation) }}</span>
      </div>
    </template>
  </v-tooltip>
</template>
