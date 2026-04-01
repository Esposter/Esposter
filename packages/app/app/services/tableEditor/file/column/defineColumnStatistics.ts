import type { ColumnStatisticsDefinition } from "@/models/tableEditor/file/column/ColumnStatisticsDefinition";
import type { ColumnStatisticsKey } from "@/models/tableEditor/file/column/ColumnStatisticsKey";

export const defineColumnStatistics = <T extends ColumnStatisticsKey>(definition: ColumnStatisticsDefinition<T>) =>
  definition;
