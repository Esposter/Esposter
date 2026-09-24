<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { pluralize } from "#shared/util/text/pluralize";
import { SHEET_IMPORT_PREVIEW_ROW_COUNT } from "@/services/resource/constants";
import { takeOne } from "@esposter/shared";

interface Props {
  dataSource: Pick<DataSource, "columns" | "rows">;
}

const { dataSource } = defineProps<Props>();
const previewColumns = computed<UiDataTableColumn<Row>[]>(() =>
  dataSource.columns.map(({ name }) => ({
    getValue: (row: Row) => String(takeOne(row.data, name) ?? ""),
    isSortable: false,
    key: name,
    title: name,
  })),
);
const previewRows = computed(() => dataSource.rows.slice(0, SHEET_IMPORT_PREVIEW_ROW_COUNT));
</script>

<template>
  <div flex flex-col gap-2>
    <p text-muted>
      Showing the first {{ previewRows.length }} of {{ dataSource.rows.length }}
      {{ pluralize("row", dataSource.rows.length) }}
    </p>
    <UiDataTable
      :columns="previewColumns"
      :get-item-title="({ id }) => id"
      :items="previewRows"
      label="Rows to import"
    />
  </div>
</template>
