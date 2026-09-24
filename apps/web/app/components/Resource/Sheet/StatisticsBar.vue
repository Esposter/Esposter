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

<template>
  <div flex flex-wrap gap-2>
    <UiChip :meaning="isFiltered ? UiIconMeaning.Filter : UiIconMeaning.Rows">
      <template v-if="isFiltered">{{ filteredRowCount }} / {{ statistics.rowCount }} rows</template>
      <template v-else>{{ statistics.rowCount }} rows</template>
    </UiChip>
    <UiChip :meaning="UiIconMeaning.Columns">{{ statistics.columnCount }} columns</UiChip>
    <UiChip :meaning="UiIconMeaning.Storage">{{ displaySize }}</UiChip>
  </div>
</template>
