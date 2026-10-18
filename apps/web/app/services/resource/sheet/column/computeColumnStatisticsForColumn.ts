import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnStatisticsKey } from "#shared/models/resource/sheet/column/ColumnStatisticsKey";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { getEffectiveColumnType } from "#shared/services/resource/sheet/column/getEffectiveColumnType";
import { buildColumnStatisticsComputeContext } from "@/services/resource/sheet/column/buildColumnStatisticsComputeContext";
import { ColumnStatisticsDefinitions } from "@/services/resource/sheet/column/ColumnStatisticsDefinitionMap";
import { computeMonthFrequencies } from "@/services/resource/sheet/column/computeMonthFrequencies";
import { computeTopFrequencies } from "@/services/resource/sheet/column/computeTopFrequencies";

// The values are the column's cells as the compiled sheet reads them, one per row, so a caller that already holds
// Them does not read every cell a second time
export const computeColumnStatisticsForColumn = (column: Column, values: ColumnValue[]): ColumnStatistics => {
  const effectiveColumnType = getEffectiveColumnType(column);
  const context = buildColumnStatisticsComputeContext(effectiveColumnType, values);
  const statisticsValues = Object.fromEntries(
    ColumnStatisticsDefinitions.map(({ applicableColumnTypes, compute, key }) => [
      key,
      applicableColumnTypes.includes(effectiveColumnType) ? compute(context) : undefined,
    ]),
  ) as Pick<ColumnStatistics, ColumnStatisticsKey>;
  const topFrequencies =
    effectiveColumnType === ColumnType.String
      ? computeTopFrequencies(context.stringCountMap)
      : effectiveColumnType === ColumnType.Date
        ? computeMonthFrequencies(context.nonNullStrings)
        : undefined;
  // The effective type, because it is the type every statistic above was computed under — reporting the
  // Declared `Computed` instead leaves the chart map with no arm for a column whose numbers it can plot
  return { columnName: column.name, columnType: effectiveColumnType, ...statisticsValues, topFrequencies };
};
