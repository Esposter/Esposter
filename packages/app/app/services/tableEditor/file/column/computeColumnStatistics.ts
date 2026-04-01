import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { ColumnStatisticsKey } from "@/models/tableEditor/file/column/ColumnStatisticsKey";
import type { ColumnStatistics } from "@/models/tableEditor/file/column/ColumnStatistics";

import { buildColumnStatisticsComputeContext } from "@/services/tableEditor/file/column/buildColumnStatisticsComputeContext";
import { ColumnStatisticsDefinitions } from "@/services/tableEditor/file/column/ColumnStatisticsDefinitionMap";
import { takeOne } from "@esposter/shared";

export const computeColumnStatistics = (dataSource: DataSource): ColumnStatistics[] =>
  dataSource.columns.map((column) => {
    const values = dataSource.rows.map((row) => takeOne(row.data, column.name));
    const context = buildColumnStatisticsComputeContext(column, values);
    const statisticsValues = Object.fromEntries(
      [...ColumnStatisticsDefinitions].map(({ applicableColumnTypes, compute, key }) => [
        key,
        applicableColumnTypes.includes(column.type) ? compute(context) : null,
      ]),
    ) as Pick<ColumnStatistics, ColumnStatisticsKey>;
    return { columnName: column.name, columnType: column.type, ...statisticsValues };
  });
