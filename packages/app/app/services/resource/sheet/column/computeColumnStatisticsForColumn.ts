import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnStatisticsKey } from "#shared/models/resource/sheet/column/ColumnStatisticsKey";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { buildColumnStatisticsComputeContext } from "@/services/resource/sheet/column/buildColumnStatisticsComputeContext";
import { ColumnStatisticsDefinitions } from "@/services/resource/sheet/column/ColumnStatisticsDefinitionMap";
import { computeMonthFrequencies } from "@/services/resource/sheet/column/computeMonthFrequencies";
import { computeTopFrequencies } from "@/services/resource/sheet/column/computeTopFrequencies";
import { getEffectiveColumnType } from "@/services/resource/sheet/column/getEffectiveColumnType";
import { takeOne } from "@esposter/shared";

export const computeColumnStatisticsForColumn = (dataSource: DataSource, column: Column): ColumnStatistics => {
  const effectiveColumnType = getEffectiveColumnType(column);
  const values = dataSource.rows.map((row) => takeOne(row.data, column.name));
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
  return { columnName: column.name, columnType: column.type, ...statisticsValues, topFrequencies };
};
