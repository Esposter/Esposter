import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

export const getValueSize = (value: ColumnValue | undefined): number => JSON.stringify(value ?? null).length;
