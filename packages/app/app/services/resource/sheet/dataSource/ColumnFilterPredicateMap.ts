import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { ColumnFilter } from "@/models/resource/sheet/column/ColumnFilter";
import type { StringColumnFilter } from "@/models/resource/sheet/column/StringColumnFilter";

import { BooleanValue } from "#shared/models/resource/sheet/column/BooleanValue";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { NULL_BOOLEAN_FILTER_VALUE } from "@/services/resource/sheet/constants";

// A filter variant may answer to more than one ColumnType (one string filter covers Date and String), so the
// Variant is selected by whether its own type union contains the key rather than by an exact match
type ColumnFilterOfType<T extends ColumnFilter["type"], F = ColumnFilter> = F extends { type: infer U }
  ? T extends U
    ? F
    : never
  : never;
type ColumnFilterPredicate<T extends ColumnFilter> = (filter: T, cellValue: ColumnValue) => boolean;

const checkIsMatchingStringCell: ColumnFilterPredicate<StringColumnFilter> = (filter, cellValue) =>
  cellValue !== null && String(cellValue).toLowerCase().includes(filter.value.toLowerCase());

export const ColumnFilterPredicateMap = {
  [ColumnType.Boolean]: (filter, cellValue) => {
    if (filter.value === NULL_BOOLEAN_FILTER_VALUE) return cellValue === null;
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
