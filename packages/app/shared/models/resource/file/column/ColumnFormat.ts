import type { BooleanFormat } from "#shared/models/resource/file/column/BooleanFormat";
import type { DateFormat } from "#shared/models/resource/file/column/DateFormat";
import type { NumberFormat } from "#shared/models/resource/file/column/NumberFormat";

export type ColumnFormat = BooleanFormat | DateFormat | NumberFormat;
