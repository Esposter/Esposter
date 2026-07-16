import type { BooleanColumnFilter } from "@/models/resource/sheet/column/BooleanColumnFilter";
import type { NumberRangeColumnFilter } from "@/models/resource/sheet/column/NumberRangeColumnFilter";
import type { StringColumnFilter } from "@/models/resource/sheet/column/StringColumnFilter";

export type ColumnFilter = BooleanColumnFilter | NumberRangeColumnFilter | StringColumnFilter;
