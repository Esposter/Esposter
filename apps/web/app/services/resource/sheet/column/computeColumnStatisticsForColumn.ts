import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnStatisticsKey } from "#shared/models/resource/sheet/column/ColumnStatisticsKey";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { buildColumnStatisticsComputeContext } from "@/services/resource/sheet/column/buildColumnStatisticsComputeContext";
import { ColumnStatisticsDefinitions } from "@/services/resource/sheet/column/ColumnStatisticsDefinitionMap";
import { computeMonthFrequencies } from "@/services/resource/sheet/column/computeMonthFrequencies";
import { computeTopFrequencies } from "@/services/resource/sheet/column/computeTopFrequencies";
import { computeValue } from "@/services/resource/sheet/column/computeValue";
import { getEffectiveColumnType } from "@/services/resource/sheet/column/getEffectiveColumnType";

export const computeColumnStatisticsForColumn = (dataSource: DataSource, column: Column): ColumnStatistics => {
  const effectiveColumnType = getEffectiveColumnType(column);
  // Through the resolver rather than the cells: a computed column never writes to `row.data`, so reading it
  // Directly reports every one of its rows as absent — neither a value nor a null
  const values = dataSource.rows.map((row, rowIndex) =>
    computeValue(dataSource.rows, row, dataSource.columns, column, rowIndex),
  );
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
