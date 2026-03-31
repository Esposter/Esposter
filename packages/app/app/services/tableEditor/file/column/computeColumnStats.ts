import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { ColumnStatKey } from "@/models/tableEditor/file/column/ColumnStatKey";
import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

import { buildColumnStatComputeContext } from "@/services/tableEditor/file/column/buildColumnStatComputeContext";
import { ColumnStatDefinitions } from "@/services/tableEditor/file/column/ColumnStatDefinitionMap";
import { takeOne } from "@esposter/shared";

export const computeColumnStats = (dataSource: DataSource): ColumnStats[] =>
  dataSource.columns.map((column) => {
    const values = dataSource.rows.map((row) => takeOne(row.data, column.name));
    const context = buildColumnStatComputeContext(column, values);
    const statValues = Object.fromEntries(
      [...ColumnStatDefinitions].map(({ applicableColumnTypes, compute, key }) => [
        key,
        applicableColumnTypes.includes(column.type) ? compute(context) : null,
      ]),
    ) as Pick<ColumnStats, ColumnStatKey>;
    return { columnName: column.name, columnType: column.type, ...statValues };
  });
