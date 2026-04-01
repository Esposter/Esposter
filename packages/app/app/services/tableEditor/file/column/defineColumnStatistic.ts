import type { ColumnStatisticDefinition } from "@/models/tableEditor/file/column/ColumnStatisticDefinition";
import type { ColumnStatisticKey } from "@/models/tableEditor/file/column/ColumnStatisticKey";

export const defineColumnStatistic = <T extends ColumnStatisticKey>(definition: ColumnStatisticDefinition<T>) =>
  definition;
