import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ColumnFilter } from "@/models/resource/sheet/column/ColumnFilter";

import { checkIsActiveColumnFilter } from "@/services/resource/sheet/column/checkIsActiveColumnFilter";
import { ColumnFilterPredicateMap } from "@/services/resource/sheet/dataSource/ColumnFilterPredicateMap";
import { takeOne } from "@esposter/shared";

export const filterDataSourceRows = (rows: Row[], columnFilters: Record<string, ColumnFilter>): Row[] => {
  const activeFilters = Object.entries(columnFilters).filter(([, filter]) => checkIsActiveColumnFilter(filter));
  if (activeFilters.length === 0) return rows;
  return rows.filter((row) =>
    activeFilters.every(([columnName, filter]) =>
      ColumnFilterPredicateMap[filter.type](filter as never, takeOne(row.data, columnName)),
    ),
  );
};
