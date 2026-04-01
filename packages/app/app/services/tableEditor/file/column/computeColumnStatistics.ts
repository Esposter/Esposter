import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { ColumnStatisticKey } from "@/models/tableEditor/file/column/ColumnStatisticKey";
import type { ColumnStatistics } from "@/models/tableEditor/file/column/ColumnStatistics";

import { buildColumnStatisticComputeContext } from "@/services/tableEditor/file/column/buildColumnStatisticComputeContext";
import { ColumnStatisticDefinitions } from "@/services/tableEditor/file/column/ColumnStatisticDefinitionMap";
import { takeOne } from "@esposter/shared";

export const computeColumnStatistics = (dataSource: DataSource): ColumnStatistics[] =>
  dataSource.columns.map((column) => {
    const values = dataSource.rows.map((row) => takeOne(row.data, column.name));
    const context = buildColumnStatisticComputeContext(column, values);
    const statisticValues = Object.fromEntries(
      [...ColumnStatisticDefinitions].map(({ applicableColumnTypes, compute, key }) => [
        key,
        applicableColumnTypes.includes(column.type) ? compute(context) : null,
      ]),
    ) as Pick<ColumnStatistics, ColumnStatisticKey>;
    return { columnName: column.name, columnType: column.type, ...statisticValues };
  });
