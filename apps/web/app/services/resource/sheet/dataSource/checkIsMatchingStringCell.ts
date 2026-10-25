import type { ColumnFilterPredicate } from "@/models/resource/sheet/column/ColumnFilterPredicate";
import type { StringColumnFilter } from "@/models/resource/sheet/column/StringColumnFilter";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

// A filter variant may answer to more than one ColumnType (one string filter covers Date and String), so the
// Variant is selected by whether its own type union contains the key rather than by an exact match
export const checkIsMatchingStringCell: ColumnFilterPredicate<StringColumnFilter> = (filter, cellValue) =>
  cellValue !== null && String(cellValue).toLowerCase().includes(filter.value.toLowerCase());
