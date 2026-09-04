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
  <v-alert
    density="compact"
    type="warning"
    :text="`${getDatasetTruncationText(truncation)}. ${DATASET_ROW_CAP_DESCRIPTION}`"
  />
</template>
