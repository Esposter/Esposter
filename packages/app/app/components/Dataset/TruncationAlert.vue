<script setup lang="ts">
import type { DatasetTruncation } from "#shared/models/dataset/DatasetTruncation";

import { DATASET_ROW_CAP_DESCRIPTION } from "#shared/services/dataset/constants";
import { getDatasetTruncationText } from "#shared/services/dataset/getDatasetTruncationText";

interface DatasetTruncationAlertProps {
  truncation: DatasetTruncation;
}

const { truncation } = defineProps<DatasetTruncationAlertProps>();
</script>

<template>
  <v-alert
    density="compact"
    type="warning"
    :text="`${getDatasetTruncationText(truncation)}. ${DATASET_ROW_CAP_DESCRIPTION}`"
  />
</template>
