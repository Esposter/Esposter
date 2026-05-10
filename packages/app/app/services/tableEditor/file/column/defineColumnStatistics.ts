import type { ColumnStatisticsKey } from "#shared/models/tableEditor/file/column/ColumnStatisticsKey";
import type { ColumnStatisticsDefinition } from "@/models/tableEditor/file/column/ColumnStatisticsDefinition";

export const defineColumnStatistics = <T extends ColumnStatisticsKey>(definition: ColumnStatisticsDefinition<T>) =>
  definition;
