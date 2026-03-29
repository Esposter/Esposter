import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

export const computeStringPatternTransformation = (values: ColumnValue[], pattern: string): string =>
  pattern.replaceAll(/\{(\d+)\}/g, (_, index) => {
    const value = values[Number(index)];
    return value === null || value === undefined ? "" : String(value);
  });
