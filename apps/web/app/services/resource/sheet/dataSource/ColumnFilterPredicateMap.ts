import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { ColumnFilter } from "@/models/resource/sheet/column/ColumnFilter";
import type { ColumnFilterOfType } from "@/models/resource/sheet/column/ColumnFilterOfType";
import type { ColumnFilterPredicate } from "@/models/resource/sheet/column/ColumnFilterPredicate";
import type { StringColumnFilter } from "@/models/resource/sheet/column/StringColumnFilter";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { BooleanFilterValue } from "@/models/resource/sheet/column/BooleanFilterValue";
import { BooleanValue } from "@/models/resource/sheet/column/BooleanValue";

// A filter variant may answer to more than one ColumnType (one string filter covers Date and String), so the
// Variant is selected by whether its own type union contains the key rather than by an exact match
const checkIsMatchingStringCell: ColumnFilterPredicate<StringColumnFilter> = (filter, cellValue) =>
  cellValue !== null && String(cellValue).toLowerCase().includes(filter.value.toLowerCase());

export const ColumnFilterPredicateMap = {
  [ColumnType.Boolean]: (filter, cellValue) => {
    if (filter.value === BooleanFilterValue.Null) return cellValue === null;
    else if (filter.value === BooleanValue.True) return cellValue === true;
    else if (filter.value === BooleanValue.False) return cellValue === false;
    else return true;
  },
  [ColumnType.Date]: checkIsMatchingStringCell,
  [ColumnType.Number]: (filter, cellValue) => {
    if (cellValue === null) return false;

    const numberValue = Number(cellValue);
    if (Number.isNaN(numberValue)) return false;
    else if (filter.minimum !== "" && numberValue < Number(filter.minimum)) return false;
    else if (filter.maximum !== "" && numberValue > Number(filter.maximum)) return false;
    else return true;
  },
  [ColumnType.String]: checkIsMatchingStringCell,
} as const satisfies {
  [K in ColumnFilter["type"]]: (filter: ColumnFilterOfType<K>, cellValue: ColumnValue) => boolean;
};
