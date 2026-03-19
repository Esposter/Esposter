import type { BooleanColumnFilter } from "@/models/tableEditor/file/column/BooleanColumnFilter";
import type { NumberRangeColumnFilter } from "@/models/tableEditor/file/column/NumberRangeColumnFilter";
import type { StringColumnFilter } from "@/models/tableEditor/file/column/StringColumnFilter";

export type ColumnFilter = BooleanColumnFilter | NumberRangeColumnFilter | StringColumnFilter;
