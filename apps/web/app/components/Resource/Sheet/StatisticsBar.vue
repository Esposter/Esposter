<script setup lang="ts">
import type { DataSourceStatistics } from "@/models/resource/sheet/dataSource/DataSourceStatistics";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getFileSize } from "@/services/file/getFileSize";

interface Props {
  filteredRowCount: number;
  statistics: DataSourceStatistics;
}

const { filteredRowCount, statistics } = defineProps<Props>();
const isFiltered = computed(() => filteredRowCount !== statistics.rowCount);
const displaySize = computed(() => getFileSize(statistics.size));
</script>

<!-- The section's size as one muted reading beside its heading, as a spreadsheet's status bar reads; a filter that
  narrows the rows marks the count in the accent, the one part of it that changes under the reader. The row count
  keeps its width beside the section's trigger, and the columns and size behind it yield theirs first -->
<template>
  <p text-sm text-muted flex gap-1 min-w-0 items-center>
    <UiIcon v-if="isFiltered" :meaning="UiIconMeaning.Filter" text-accent />
    <span   shrink-0 text-nowrap >
      <template v-if="isFiltered">{{ filteredRowCount }} of {{ statistics.rowCount }} rows</template>
      <template v-else>{{ statistics.rowCount }} rows</template>
    </span>
    <span truncate>· {{ statistics.columnCount }} columns · {{ displaySize }}</span>
  </p>
</template>
