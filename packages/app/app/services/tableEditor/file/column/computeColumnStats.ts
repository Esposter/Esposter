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
        average: null,
        columnName: column.name,
        columnType: ColumnType.Boolean,
        falseCount: nonNull.filter((v) => !v).length,
        maximum: null,
        minimum: null,
        nullCount,
        standardDeviation: null,
        trueCount: nonNull.filter(Boolean).length,
        uniqueCount: null,
      };
    }

    if (column.type === ColumnType.Number) {
      const nonNull = values.filter((v) => typeof v === "number");
      const minimum = nonNull.length > 0 ? nonNull.reduce((m, v) => Math.min(m, v), Infinity) : null;
      const maximum = nonNull.length > 0 ? nonNull.reduce((m, v) => Math.max(m, v), -Infinity) : null;
      const average =
        nonNull.length > 0 ? Math.round((nonNull.reduce((sum, v) => sum + v, 0) / nonNull.length) * 100) / 100 : null;
      const variance =
        average !== null && nonNull.length > 0
          ? nonNull.reduce((sum, v) => sum + (v - average) ** 2, 0) / nonNull.length
          : null;
      const standardDeviation = variance === null ? null : Math.round(Math.sqrt(variance) * 100) / 100;
      return {
        average,
        columnName: column.name,
        columnType: ColumnType.Number,
        falseCount: null,
        maximum,
        minimum,
        nullCount,
        standardDeviation,
        trueCount: null,
        uniqueCount: new Set(nonNull).size,
      };
    }

    const nonNull = values.filter((v) => typeof v === "string");
    return {
      average: null,
      columnName: column.name,
      columnType: column.type,
      falseCount: null,
      maximum: null,
      minimum: null,
      nullCount,
      standardDeviation: null,
      trueCount: null,
      uniqueCount: new Set(nonNull).size,
    };
  });
