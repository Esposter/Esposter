import type { ColumnStatisticsKey } from "#shared/models/resource/sheet/column/ColumnStatisticsKey";
import type { ColumnStatisticsDefinition } from "@/models/resource/sheet/column/ColumnStatisticsDefinition";

export const defineColumnStatistics = <T extends ColumnStatisticsKey>(definition: ColumnStatisticsDefinition<T>) =>
  definition;
