import type { ColumnStatisticsRow } from "@/models/resource/sheet/column/ColumnStatisticsRow";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { ColumnStatisticsDefinitions } from "@/services/resource/sheet/column/ColumnStatisticsDefinitionMap";

// A row is the column paired with its statistics, so every column reads through an accessor rather than through
// A key naming a top-level field
export const ColumnStatisticsHeaders: DataTableHeader<ColumnStatisticsRow>[] = [
  { key: "chart", sortable: false, title: "" },
  { key: "columnName", sortable: false, title: "Column", value: ({ column }) => column.name },
  { key: "columnType", sortable: false, title: "Type", value: ({ statistics }) => statistics.columnType },
  ...ColumnStatisticsDefinitions.map(({ key, sortable, title }) => ({
    key,
    sortable,
    title,
    value: ({ statistics }: ColumnStatisticsRow) => statistics[key],
  })),
];
