import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { ColumnStatistics } from "@/models/tableEditor/file/column/ColumnStatistics";
import type { ColumnStatisticsKey } from "@/models/tableEditor/file/column/ColumnStatisticsKey";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { buildColumnStatisticsComputeContext } from "@/services/tableEditor/file/column/buildColumnStatisticsComputeContext";
import { ColumnStatisticsDefinitions } from "@/services/tableEditor/file/column/ColumnStatisticsDefinitionMap";
import { getComputedColumnEffectiveType } from "@/services/tableEditor/file/column/getComputedColumnEffectiveType";
import { takeOne } from "@esposter/shared";

export const computeColumnStatistics = (dataSource: DataSource): ColumnStatistics[] =>
  dataSource.columns.map((column) => {
    const effectiveColumnType =
      column.type === ColumnType.Computed ? getComputedColumnEffectiveType(column) : column.type;
    const values = dataSource.rows.map((row) => takeOne(row.data, column.name));
    const context = buildColumnStatisticsComputeContext(
      Object.assign(structuredClone(column), { type: effectiveColumnType }),
      values,
    );
    const statisticsValues = Object.fromEntries(
      [...ColumnStatisticsDefinitions].map(({ applicableColumnTypes, compute, key }) => [
        key,
        applicableColumnTypes.includes(effectiveColumnType) ? compute(context) : null,
      ]),
    ) as Pick<ColumnStatistics, ColumnStatisticsKey>;
    return { columnName: column.name, columnType: column.type, ...statisticsValues };
  });
