import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { ColumnStatComputeContext } from "@/models/tableEditor/file/column/ColumnStatComputeContext";
import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

import { ColumnStatDefinitionMap } from "@/services/tableEditor/file/column/ColumnStatDefinitionMap";
import { takeOne } from "@esposter/shared";

export const computeColumnStats = (dataSource: DataSource): ColumnStats[] =>
  dataSource.columns.map((column) => {
    const values = dataSource.rows.map((row) => takeOne(row.data, column.name));
    const context: ColumnStatComputeContext = {
      column,
      nonNullBooleans: values.filter((value): value is boolean => typeof value === "boolean"),
      nonNullNumbers: values.filter((value): value is number => typeof value === "number"),
      nonNullStrings: values.filter((value): value is string => typeof value === "string"),
      nullCount: values.filter((value) => value === null).length,
      values,
    };
    return {
      columnName: column.name,
      columnType: column.type,
      ...Object.fromEntries(
        Object.values(ColumnStatDefinitionMap).map(({ applicableColumnTypes, compute, key }) => [
          key,
          applicableColumnTypes.includes(column.type) ? compute(context) : null,
        ]),
      ),
    } as ColumnStats;
  });
