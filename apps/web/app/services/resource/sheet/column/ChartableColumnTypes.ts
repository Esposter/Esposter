import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

import { ColumnChartDataMap } from "@/services/resource/sheet/column/ColumnChartDataMap";

export const ChartableColumnTypes: ReadonlySet<ColumnType> = new Set(Object.keys(ColumnChartDataMap) as ColumnType[]);
