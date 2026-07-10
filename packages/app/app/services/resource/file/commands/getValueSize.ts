import type { ColumnValue } from "#shared/models/resource/file/column/ColumnValue";

export const getValueSize = (value: ColumnValue | undefined): number => JSON.stringify(value ?? null).length;
