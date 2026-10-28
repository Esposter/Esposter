import type { ColumnFilter } from "@/models/resource/sheet/column/ColumnFilter";
import type { ColumnFilterOfType } from "@/models/resource/sheet/column/ColumnFilterOfType";
import type { ColumnFilterPredicate } from "@/models/resource/sheet/column/ColumnFilterPredicate";

import { BooleanValue } from "#shared/models/resource/sheet/column/BooleanValue";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { BooleanFilterValue } from "@/models/resource/sheet/column/BooleanFilterValue";
import { checkIsMatchingStringCell } from "@/services/resource/sheet/dataSource/checkIsMatchingStringCell";

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
    if (
      Number.isNaN(numberValue) ||
      (filter.minimum !== "" && numberValue < Number(filter.minimum)) ||
      (filter.maximum !== "" && numberValue > Number(filter.maximum))
    )
      return false;
    else return true;
  },
  [ColumnType.String]: checkIsMatchingStringCell,
} as const satisfies {
  [K in ColumnFilter["type"]]: ColumnFilterPredicate<ColumnFilterOfType<K>>;
};
