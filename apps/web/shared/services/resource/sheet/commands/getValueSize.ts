import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

const TEXT_ENCODER = new TextEncoder();

// Measured in UTF-8 bytes, the unit a column's size is displayed in, over the JSON text the value is stored as
export const getValueSize = (value: ColumnValue | undefined) =>
  TEXT_ENCODER.encode(JSON.stringify(value ?? null)).byteLength;
