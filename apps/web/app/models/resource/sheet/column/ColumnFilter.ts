import type { BooleanColumnFilter } from "#src/models/resource/sheet/column/BooleanColumnFilter";
import type { NumberRangeColumnFilter } from "#src/models/resource/sheet/column/NumberRangeColumnFilter";
import type { StringColumnFilter } from "#src/models/resource/sheet/column/StringColumnFilter";

export type ColumnFilter = BooleanColumnFilter | NumberRangeColumnFilter | StringColumnFilter;
