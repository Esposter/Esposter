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
      const sum = nonNull.reduce((s, v) => s + v, 0);
      const rawAverage = nonNull.length > 0 ? sum / nonNull.length : null;
      const average = rawAverage === null ? null : Math.round(rawAverage * 100) / 100;
      const variance =
        rawAverage === null || nonNull.length === 0
          ? null
          : nonNull.reduce((s, v) => s + (v - rawAverage) ** 2, 0) / nonNull.length;
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
