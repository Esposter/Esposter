<script setup lang="ts">
import type { DatasetTruncation } from "@/models/dataset/DatasetTruncation";

import { DATASET_ROW_CAP_DESCRIPTION } from "#shared/services/dataset/constants";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getDatasetTruncationText } from "@/services/dataset/getDatasetTruncationText";

interface Props {
  truncation: DatasetTruncation;
}

const { truncation } = defineProps<Props>();
</script>

<template>
  <!-- The whole footnote names the tooltip, so the explanation is reachable from the text as well as the mark -->
  <UiTooltip #default="{ activatorProps }" :label="DATASET_ROW_CAP_DESCRIPTION">
    <p :="activatorProps" tabindex="0" text-muted flex gap-1 items-center>
      <span text-warning flex><UiIcon :meaning="UiIconMeaning.Warning" /></span>
      {{ getDatasetTruncationText(truncation) }}
    </p>
  </UiTooltip>
</template>
