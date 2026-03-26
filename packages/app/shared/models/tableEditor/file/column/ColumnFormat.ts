import type { BooleanFormat } from "#shared/models/tableEditor/file/column/BooleanFormat";
import type { DateFormat } from "#shared/models/tableEditor/file/column/DateFormat";
import type { NumberFormat } from "#shared/models/tableEditor/file/column/NumberFormat";

export type ColumnFormat = BooleanFormat | DateFormat | NumberFormat;
