import type { BooleanColumnFilter } from "@/models/resource/file/column/BooleanColumnFilter";
import type { NumberRangeColumnFilter } from "@/models/resource/file/column/NumberRangeColumnFilter";
import type { StringColumnFilter } from "@/models/resource/file/column/StringColumnFilter";

export type ColumnFilter = BooleanColumnFilter | NumberRangeColumnFilter | StringColumnFilter;
