<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { pluralize } from "#shared/util/text/pluralize";
import { SHEET_IMPORT_PREVIEW_ROW_COUNT } from "@/services/resource/constants";
import { takeOne } from "@esposter/shared";

interface Props {
  dataSource: Pick<DataSource, "columns" | "rows">;
}

const { dataSource } = defineProps<Props>();
const previewHeaders = computed(() =>
  dataSource.columns.map(({ name }) => ({
    key: name,
    title: name,
    value: (row: Row) => takeOne(row.data, name),
  })),
);
const previewRows = computed(() => dataSource.rows.slice(0, SHEET_IMPORT_PREVIEW_ROW_COUNT));
</script>

<template>
  <div flex flex-col gap-2>
    <span text-hint>
      Showing first {{ previewRows.length }} of {{ dataSource.rows.length }}
      {{ pluralize("row", dataSource.rows.length) }}
    </span>
    <v-data-table density="compact" hide-default-footer :headers="previewHeaders" :items="previewRows" />
  </div>
</template>
