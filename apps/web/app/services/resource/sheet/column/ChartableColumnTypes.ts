import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ColumnTypeChartDataComputeMap } from "@/services/resource/sheet/column/ColumnTypeChartDataComputeMap";

export const ChartableColumnTypes: ReadonlySet<ColumnType> = new Set(
  Object.values(ColumnType).filter((columnType) => columnType in ColumnTypeChartDataComputeMap),
);
