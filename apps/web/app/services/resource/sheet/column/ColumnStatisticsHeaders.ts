import type { ColumnStatisticsRow } from "@/models/resource/sheet/column/ColumnStatisticsRow";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { ColumnStatisticsDefinitions } from "@/services/resource/sheet/column/ColumnStatisticsDefinitionMap";
import { compareColumnValues } from "@/services/resource/sheet/column/compareColumnValues";

// A row is the column paired with its statistics, so every column reads through an accessor rather than through
// A key naming a top-level field. A statistic shows in its column's units and sorts by the number behind them
export const ColumnStatisticsHeaders: UiDataTableColumn<ColumnStatisticsRow>[] = [
  { isSortable: false, key: "chart", title: "" },
  { getValue: ({ column }) => column.name, isSortable: false, key: "columnName", title: "Column" },
  { getValue: ({ statistics }) => statistics.columnType, isSortable: false, key: "columnType", title: "Type" },
  ...ColumnStatisticsDefinitions.map(({ format, key, sortable, title }) => ({
    compare: (firstRow: ColumnStatisticsRow, secondRow: ColumnStatisticsRow) => {
      const [firstValue = null, secondValue = null] = [firstRow.statistics[key], secondRow.statistics[key]].map(
        (value) => (typeof value === "number" || typeof value === "string" ? value : null),
      );
      return compareColumnValues(firstValue, secondValue);
    },
    // The key is only known at runtime, so the compiler cannot correlate a statistic with its own format's input
    getValue: ({ column, statistics }: ColumnStatisticsRow) => format(statistics[key] as never, column),
    ...(sortable === false ? { isSortable: false as const } : {}),
    key,
    title,
  })),
];
