import type { ColumnStatisticsKey } from "#shared/models/resource/file/column/ColumnStatisticsKey";
import type { ColumnStatisticsDefinition } from "@/models/resource/file/column/ColumnStatisticsDefinition";

export const defineColumnStatistics = <T extends ColumnStatisticsKey>(definition: ColumnStatisticsDefinition<T>) =>
  definition;
