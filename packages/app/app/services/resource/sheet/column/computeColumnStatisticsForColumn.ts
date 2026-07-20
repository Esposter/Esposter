import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnStatisticsKey } from "#shared/models/resource/sheet/column/ColumnStatisticsKey";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { buildColumnStatisticsComputeContext } from "@/services/resource/sheet/column/buildColumnStatisticsComputeContext";
import { ColumnStatisticsDefinitions } from "@/services/resource/sheet/column/ColumnStatisticsDefinitionMap";
import { computeMonthFrequencies } from "@/services/resource/sheet/column/computeMonthFrequencies";
import { computeTopFrequencies } from "@/services/resource/sheet/column/computeTopFrequencies";
import { getComputedColumnEffectiveType } from "@/services/resource/sheet/column/getComputedColumnEffectiveType";
import { takeOne, toRawDeep } from "@esposter/shared";

export const computeColumnStatisticsForColumn = (dataSource: DataSource, column: Column): ColumnStatistics => {
  const effectiveColumnType =
    column.type === ColumnType.Computed ? getComputedColumnEffectiveType(column) : column.type;
  const values = dataSource.rows.map((row) => takeOne(row.data, column.name));
  const context = buildColumnStatisticsComputeContext(
    Object.assign(structuredClone(toRawDeep(column)), { type: effectiveColumnType }),
    values,
  );
  const statisticsValues = Object.fromEntries(
    ColumnStatisticsDefinitions.map(({ applicableColumnTypes, compute, key }) => [
      key,
      applicableColumnTypes.includes(effectiveColumnType) ? compute(context) : null,
    ]),
  ) as Pick<ColumnStatistics, ColumnStatisticsKey>;
  const topFrequencies =
    effectiveColumnType === ColumnType.String
      ? computeTopFrequencies(context.nonNullStrings)
      : effectiveColumnType === ColumnType.Date
        ? computeMonthFrequencies(context.nonNullStrings)
        : null;
  return { columnName: column.name, columnType: column.type, ...statisticsValues, topFrequencies };
};
