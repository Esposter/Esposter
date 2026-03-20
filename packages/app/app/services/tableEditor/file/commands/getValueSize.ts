import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";

export const getValueSize = (value: ColumnValue | undefined): number => JSON.stringify(value ?? null).length;
