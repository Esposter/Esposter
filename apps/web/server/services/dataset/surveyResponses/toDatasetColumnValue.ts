import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

export const toDatasetColumnValue = (value: unknown): ColumnValue => {
  if (value === null || value === undefined) return null;
  else if (typeof value === "boolean" || typeof value === "number" || typeof value === "string") return value;
  else if (value instanceof Date) return value.toISOString();
  else return JSON.stringify(value);
};
