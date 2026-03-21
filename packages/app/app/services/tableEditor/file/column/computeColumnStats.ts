import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { ColumnStatComputeContext } from "@/models/tableEditor/file/column/ColumnStatComputeContext";
import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

import { ColumnStatDefinitions } from "@/services/tableEditor/file/column/ColumnStatDefinitions";
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
        ColumnStatDefinitions.map(({ appliesTo, compute, key }) => [
          key,
          appliesTo.includes(column.type) ? compute(context) : null,
        ]),
      ),
    } as ColumnStats;
  });
