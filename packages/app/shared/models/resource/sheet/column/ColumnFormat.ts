import type { BooleanFormat } from "#shared/models/resource/sheet/column/BooleanFormat";
import type { DateFormat } from "#shared/models/resource/sheet/column/DateFormat";
import type { NumberFormat } from "#shared/models/resource/sheet/column/NumberFormat";

export type ColumnFormat = BooleanFormat | DateFormat | NumberFormat;
