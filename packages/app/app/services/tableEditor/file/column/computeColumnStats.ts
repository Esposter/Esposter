import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { takeOne } from "@esposter/shared";

export const computeColumnStats = (dataSource: DataSource): ColumnStats[] =>
  dataSource.columns.map((column) => {
    const values = dataSource.rows.map((row) => takeOne(row.data, column.name));
    const nullCount = values.filter((v) => v === null).length;

    if (column.type === ColumnType.Boolean) {
      const nonNull = values.filter((v) => typeof v === "boolean");
      return {
        avg: null,
        columnName: column.name,
        columnType: ColumnType.Boolean,
        falseCount: nonNull.filter((v) => !v).length,
        max: null,
        min: null,
        nullCount,
        trueCount: nonNull.filter(Boolean).length,
        uniqueCount: null,
      };
    }

    if (column.type === ColumnType.Number) {
      const nonNull = values.filter((v) => typeof v === "number");
      const min = nonNull.length > 0 ? nonNull.reduce((m, v) => Math.min(m, v), Infinity) : null;
      const max = nonNull.length > 0 ? nonNull.reduce((m, v) => Math.max(m, v), -Infinity) : null;
      const avg =
        nonNull.length > 0 ? Math.round((nonNull.reduce((sum, v) => sum + v, 0) / nonNull.length) * 100) / 100 : null;
      return {
        avg,
        columnName: column.name,
        columnType: ColumnType.Number,
        falseCount: null,
        max,
        min,
        nullCount,
        trueCount: null,
        uniqueCount: new Set(nonNull).size,
      };
    }

    const nonNull = values.filter((v) => typeof v === "string");
    return {
      avg: null,
      columnName: column.name,
      columnType: column.type,
      falseCount: null,
      max: null,
      min: null,
      nullCount,
      trueCount: null,
      uniqueCount: new Set(nonNull).size,
    };
  });
