import type { ColumnStatistics } from "#shared/models/resource/file/column/ColumnStatistics";
import type { ColumnStatisticsKey } from "#shared/models/resource/file/column/ColumnStatisticsKey";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { buildColumnStatisticsComputeContext } from "@/services/resource/file/column/buildColumnStatisticsComputeContext";
import { ColumnStatisticsDefinitions } from "@/services/resource/file/column/ColumnStatisticsDefinitionMap";
import { computeMonthFrequencies } from "@/services/resource/file/column/computeMonthFrequencies";
import { computeTopFrequencies } from "@/services/resource/file/column/computeTopFrequencies";
import { getComputedColumnEffectiveType } from "@/services/resource/file/column/getComputedColumnEffectiveType";
import { takeOne, toRawDeep } from "@esposter/shared";

export const computeColumnStatistics = (dataSource: DataSource): ColumnStatistics[] =>
  dataSource.columns.map((column) => {
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
  });
