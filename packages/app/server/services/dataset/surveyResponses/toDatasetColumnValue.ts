import type { ColumnValue } from "#shared/models/resource/file/column/ColumnValue";

export const toDatasetColumnValue = (value: unknown): ColumnValue => {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean" || typeof value === "number" || typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
};
